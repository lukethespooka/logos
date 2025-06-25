// Follow this format: https://supabase.com/docs/guides/functions/quickstart#creating-a-function

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return new Response(
    JSON.stringify({ message: "Hello, LogOS!" }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  )
})
