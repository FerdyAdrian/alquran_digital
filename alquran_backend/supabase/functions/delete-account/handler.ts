type Services = {
  authenticate: (token: string) => Promise<string | null>;
  revoke: (token: string) => Promise<void>;
  remove: (userId: string) => Promise<void>;
};
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json' };
export function createDeleteHandler(services: Services) {
  return async (request: Request): Promise<Response> => {
    const reply = (status: number, body: object) => new Response(JSON.stringify(body), { status, headers });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return reply(405, { error: 'Method not allowed' });
    const token = /^Bearer\s+(\S+)$/i.exec(request.headers.get('Authorization') ?? '')?.[1];
    if (!token || token.length > 16384) return reply(401, { error: 'Authentication required' });
    let userId: string | null;
    try { userId = await services.authenticate(token); } catch { return reply(401, { error: 'Invalid session' }); }
    if (!userId) return reply(401, { error: 'Invalid session' });
    try {
      await services.revoke(token);
      // Identity comes only from verified Auth; request bodies cannot select another account.
      await services.remove(userId);
      return reply(200, { deleted: true });
    } catch { return reply(500, { error: 'Deletion failed. Contact support or sign in and try again.' }); }
  };
}
