import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ResponseBody {
  error?: string;
  success?: boolean;
}

function respond(status: number, body: ResponseBody): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
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
  const { data, error: userError } = await userClient.auth.getUser();
  if (userError || !data.user) {
    return respond(401, { error: 'Unauthorized' });
  }

  const adminClient = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(data.user.id);
  if (deleteError) {
    return respond(500, { error: 'Could not delete account' });
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
