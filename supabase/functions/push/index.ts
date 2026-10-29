import { createClient } from 'jsr:@supabase/supabase-js@2';

const expoPushUrl = 'https://exp.host/--/api/v2/push/send';
const chunkSize = 100;

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-push-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ResponseBody {
  error?: string;
  success?: boolean;
  sent?: number;
  removed?: number;
}

interface PushRequest {
  user_id: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  sound: 'default';
  channelId: 'general';
  priority: 'high';
}

interface PushTicket {
  status: 'ok' | 'error';
  details?: { error?: string };
}

interface PushConfig {
  url: string;
  serviceRoleKey: string;
  expoToken: string;
  secret: string;
}

function respond(status: number, body: ResponseBody): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

function isPushRequest(value: unknown): value is PushRequest {
  if (!isRecord(value)) return false;
  const data = value['data'];
  return (
    isText(value['user_id']) &&
    isText(value['title']) &&
    isText(value['body']) &&
    (data === undefined || isRecord(data))
  );
}

function isPushTicket(value: unknown): value is PushTicket {
  if (!isRecord(value)) return false;
  const details = value['details'];
  return (value['status'] === 'ok' || value['status'] === 'error') && (details === undefined || isRecord(details));
}

function readConfig(): PushConfig | null {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const expoToken = Deno.env.get('EXPO_ACCESS_TOKEN');
  if (!url || !serviceRoleKey || !expoToken) return null;
  return { url, serviceRoleKey, expoToken, secret: Deno.env.get('PUSH_FUNCTION_SECRET') ?? '' };
}

function isAuthorized(request: Request, config: PushConfig): boolean {
  if (config.secret && request.headers.get('x-push-secret') === config.secret) return true;
  return request.headers.get('Authorization') === `Bearer ${config.serviceRoleKey}`;
}

function tokensFrom(rows: unknown): string[] {
  if (!Array.isArray(rows)) return [];
  return rows.flatMap((row: unknown): string[] => {
    const token = isRecord(row) ? row['expo_token'] : undefined;
    return typeof token === 'string' ? [token] : [];
  });
}

function buildMessage(token: string, request: PushRequest): PushMessage {
  return {
    to: token,
    title: request.title,
    body: request.body,
    data: request.data ?? {},
    sound: 'default',
    channelId: 'general',
    priority: 'high',
  };
}

async function sendChunk(group: PushMessage[], expoToken: string): Promise<PushTicket[] | null> {
  try {
    const response = await fetch(expoPushUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${expoToken}`,
      },
      body: JSON.stringify(group),
    });
    if (!response.ok) return null;
    const body: unknown = await response.json();
    const tickets = isRecord(body) ? body['data'] : undefined;
    if (!Array.isArray(tickets) || tickets.length !== group.length || !tickets.every(isPushTicket)) return null;
    return tickets;
  } catch {
    return null;
  }
}

async function handle(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (request.method !== 'POST') {
    return respond(405, { error: 'Method not allowed' });
  }

  const config = readConfig();
  if (!config) {
    return respond(500, { error: 'Function is not configured' });
  }
  if (!isAuthorized(request, config)) {
    return respond(401, { error: 'Unauthorized' });
  }

  const payload: unknown = await request.json().catch((): undefined => undefined);
  if (!isPushRequest(payload)) {
    return respond(400, { error: 'Invalid body' });
  }

  const adminClient = createClient(config.url, config.serviceRoleKey, { auth: { persistSession: false } });
  const { data: rows, error: readError } = await adminClient
    .from('push_tokens')
    .select('expo_token')
    .eq('user_id', payload.user_id);
  if (readError) {
    return respond(500, { error: 'Could not read tokens' });
  }

  const messages = tokensFrom(rows).map((token) => buildMessage(token, payload));
  let sent = 0;
  const dead: string[] = [];
  for (let start = 0; start < messages.length; start += chunkSize) {
    const group = messages.slice(start, start + chunkSize);
    const tickets = await sendChunk(group, config.expoToken);
    if (!tickets) {
      return respond(502, { error: 'Push service error' });
    }
    tickets.forEach((ticket, index) => {
      if (ticket.status === 'ok') {
        sent += 1;
      } else if (ticket.details?.error === 'DeviceNotRegistered' && group[index]) {
        dead.push(group[index].to);
      }
    });
  }

  if (dead.length > 0) {
    const { error: deleteError } = await adminClient.from('push_tokens').delete().in('expo_token', dead);
    if (deleteError) {
      return respond(500, { error: 'Could not remove tokens' });
    }
  }

  return respond(200, { success: true, sent, removed: dead.length });
}

Deno.serve(async (request: Request): Promise<Response> => {
  try {
    return await handle(request);
  } catch {
    return respond(500, { error: 'Unexpected error' });
  }
});
