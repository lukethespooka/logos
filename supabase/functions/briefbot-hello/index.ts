// Follow this format: https://supabase.com/docs/guides/functions/quickstart#creating-a-function

Deno.serve(async (req) => {
  return new Response(
    JSON.stringify({ message: "Hello, LogOS!" }),
    { headers: { "Content-Type": "application/json" } }
  )
})
