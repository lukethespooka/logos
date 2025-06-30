export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-real-ip',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours cache for preflight requests
  'Access-Control-Allow-Credentials': 'true',
};

/**
 * Handles CORS preflight requests and adds CORS headers to responses
 */
export async function handleCors(req: Request): Promise<Response | null> {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
      }
    });
  }
  
  // For actual requests, return null to continue processing
  return null;
}

/**
 * Wraps a response with CORS headers
 */
export function wrapResponse(response: Response): Response {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    headers.set(key, value);
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
} 