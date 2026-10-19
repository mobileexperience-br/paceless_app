import { createClient } from 'jsr:@supabase/supabase-js@2';

const ENTITLEMENT = 'premium';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface RevenueCatEvent {
  type?: string;
  app_user_id?: string;
  transferred_to?: string[];
  entitlement_ids?: string[] | null;
  expiration_at_ms?: number | null;
}

interface WebhookPayload {
  event?: RevenueCatEvent;
}

interface SubscriberResponse {
  subscriber?: {
    entitlements?: Record<string, { expires_date?: string | null } | undefined>;
  };
}

interface Entitlement {
  userId: string;
  expiresAtMs: number | null;
  isActive: boolean;
}

function respond(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isActive(type: string | undefined, expiresAtMs: number | null): boolean {
  if (type === 'EXPIRATION') {
    return false;
  }
  return expiresAtMs === null || expiresAtMs > Date.now();
}

async function fetchEntitlement(userId: string): Promise<Entitlement | null> {
  const secret = Deno.env.get('REVENUECAT_SECRET_KEY');
  if (!secret) {
    return null;
  }
  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  );
  if (!response.ok) {
    return null;
  }
  const body = (await response.json()) as SubscriberResponse;
  const info = body.subscriber?.entitlements?.[ENTITLEMENT];
  if (!info) {
    return { userId, expiresAtMs: null, isActive: false };
  }
  const expiresAtMs = info.expires_date ? Date.parse(info.expires_date) : null;
  return { userId, expiresAtMs, isActive: isActive(undefined, expiresAtMs) };
}

async function resolveEntitlements(event: RevenueCatEvent): Promise<Entitlement[]> {
  if (event.type === 'TRANSFER') {
    const targets = (event.transferred_to ?? []).filter((id) => UUID_PATTERN.test(id));
    const results = await Promise.all(targets.map(fetchEntitlement));
    return results.filter((item): item is Entitlement => item !== null);
  }
  const userId = event.app_user_id;
  if (!userId || !UUID_PATTERN.test(userId)) {
    return [];
  }
  if (!event.entitlement_ids?.includes(ENTITLEMENT)) {
    return [];
  }
  const expiresAtMs = event.expiration_at_ms ?? null;
  return [{ userId, expiresAtMs, isActive: isActive(event.type, expiresAtMs) }];
}

async function handle(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return respond(405, { error: 'Method not allowed' });
  }

  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const expected = Deno.env.get('REVENUECAT_WEBHOOK_AUTH');

  if (!url || !serviceRoleKey || !expected) {
    return respond(500, { error: 'Function is not configured' });
  }
  if (request.headers.get('Authorization') !== expected) {
    return respond(401, { error: 'Unauthorized' });
  }

  const payload = (await request.json()) as WebhookPayload;
  if (!payload.event) {
    return respond(400, { error: 'Invalid payload' });
  }

  const entitlements = await resolveEntitlements(payload.event);
  if (entitlements.length === 0) {
    return respond(200, { ignored: true });
  }

  const adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const rows = entitlements.map((item) => ({
    user_id: item.userId,
    entitlement: ENTITLEMENT,
    is_active: item.isActive,
    expires_at: item.expiresAtMs === null ? null : new Date(item.expiresAtMs).toISOString(),
    updated_at: new Date().toISOString(),
  }));
  const { error } = await adminClient
    .from('subscriptions')
    .upsert(rows, { onConflict: 'user_id,entitlement' });
  if (error) {
    return respond(500, { error: 'Could not save subscription' });
  }

  return respond(200, { success: true });
}

Deno.serve(async (request: Request): Promise<Response> => {
  try {
    return await handle(request);
  } catch {
    return respond(500, { error: 'Unexpected error' });
  }
});
