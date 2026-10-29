import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import { buildPlan } from '../_shared/plan/generate.ts';
import { dayMs, isValidDate, parseDate } from '../_shared/plan/schedule.ts';
import { fieldsOf, parseActivePlan, parseProfile, type ActivePlan, type ProfileSettings } from '../_shared/plan/rows.ts';
import type { GeneratedPlan, Tier } from '../_shared/plan/types.ts';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ResponseBody {
  status?: 'generated' | 'unchanged';
  userPlanId?: string;
  tier?: Tier;
  weeks?: number;
  fullWeeks?: number;
  sessions?: number;
  error?: string;
}

class StorageFailure extends Error {}

function respond(status: number, body: ResponseBody): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function unchangedResponse(userPlanId: string, tier: Tier, weeks: number, fullWeeks: number): Response {
  return respond(200, { status: 'unchanged', userPlanId, tier, weeks, fullWeeks });
}

function unwrap<T>(result: { data: T | null; error: unknown }): T | null {
  if (result.error) throw new StorageFailure('query failed');
  return result.data;
}

function todayInSaoPaulo(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

function isWithinReach(startDate: string): boolean {
  if (!isValidDate(startDate)) return false;
  return Math.abs(parseDate(startDate) - parseDate(todayInSaoPaulo())) <= dayMs;
}

async function readBody(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}

function startDateFrom(body: unknown): string | null {
  const fields = fieldsOf(body);
  const requested = fields.get('startDate');
  if (requested === undefined) return todayInSaoPaulo();
  return typeof requested === 'string' && isWithinReach(requested) ? requested : null;
}

function countSessions(plan: GeneratedPlan): number {
  return plan.weeks.reduce((total, week) => total + week.workouts.length, 0);
}

async function loadProfile(admin: SupabaseClient, userId: string): Promise<ProfileSettings | null> {
  const result = await admin
    .from('profiles')
    .select('goal, level, training_days, strength')
    .eq('id', userId)
    .maybeSingle();
  return parseProfile(unwrap(result));
}

async function isPremium(admin: SupabaseClient, userId: string): Promise<boolean> {
  const result = await admin
    .from('subscriptions')
    .select('user_id')
    .eq('user_id', userId)
    .eq('entitlement', 'premium')
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .maybeSingle();
  return unwrap(result) !== null;
}

async function loadActivePlan(admin: SupabaseClient, userId: string): Promise<ActivePlan | null> {
  const result = await admin
    .from('user_plans')
    .select('id, started_at, plans(settings_hash, tier)')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();
  return parseActivePlan(unwrap(result));
}

async function handle(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return respond(405, { error: 'Method not allowed' });
  }

  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const authorization = request.headers.get('Authorization');
  if (!url || !anonKey || !serviceRoleKey) {
    return respond(500, { error: 'Function is not configured' });
  }
  if (!authorization) {
    return respond(401, { error: 'Unauthorized' });
  }

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return respond(401, { error: 'Unauthorized' });
  }

  const body = await readBody(request);
  const startDate = startDateFrom(body);
  if (startDate === null) {
    return respond(400, { error: 'invalid_start_date' });
  }
  const force = fieldsOf(body).get('force') === true;

  const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const userId = userData.user.id;
  const profile = await loadProfile(admin, userId);
  if (!profile) {
    return respond(422, { error: 'profile_incomplete' });
  }

  const tier: Tier = (await isPremium(admin, userId)) ? 'full' : 'free';
  const active = await loadActivePlan(admin, userId);

  const upgrading = active?.tier === 'free' && tier === 'full';
  const planStart = upgrading && active ? active.startedAt : startDate;
  const plan = buildPlan({ ...profile, tier, startDate: planStart });
  const weeks = plan.weeks.length;
  const fullWeeks = plan.full_weeks;

  if (active && active.settingsHash === plan.settings_hash && !force) {
    return unchangedResponse(active.id, tier, weeks, fullWeeks);
  }

  const rpcResult = await admin.rpc('replace_generated_plan', {
    p_user: userId,
    p_start: planStart,
    p_today: todayInSaoPaulo(),
    p_force: force,
    p_plan: plan,
  });
  const userPlanId: unknown = unwrap(rpcResult);
  if (typeof userPlanId !== 'string') {
    throw new StorageFailure('replace_generated_plan returned no id');
  }
  if (active && userPlanId === active.id && !force) {
    return unchangedResponse(userPlanId, tier, weeks, fullWeeks);
  }
  return respond(200, {
    status: 'generated',
    userPlanId,
    tier,
    weeks,
    fullWeeks,
    sessions: countSessions(plan),
  });
}

Deno.serve(async (request: Request): Promise<Response> => {
  try {
    return await handle(request);
  } catch (error) {
    if (error instanceof StorageFailure) {
      return respond(500, { error: 'Could not generate plan' });
    }
    return respond(500, { error: 'Unexpected error' });
  }
});
