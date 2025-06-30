import { corsHeaders } from '../_shared/cors.ts';
import { handleError } from '../_shared/error-handler.ts';
import { validateEncryption, encryptToken, decryptToken } from '../_shared/encryption.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // First validate the encryption setup
    const isValid = await validateEncryption();
    if (!isValid) {
      throw new Error('Encryption validation failed');
    }

    // Test encryption and decryption with a sample token
    const testToken = `test-token-${Date.now()}`;
    const encrypted = await encryptToken(testToken);
    const decrypted = await decryptToken(encrypted);

    // Verify the round trip
    if (testToken !== decrypted) {
      throw new Error('Encryption round trip validation failed');
    }

    // Return success with some stats
    return new Response(
      JSON.stringify({
        success: true,
        data: {
          status: 'Encryption working correctly',
          encryptedLength: encrypted.length,
          originalLength: testToken.length,
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return handleError(error, req);
  }
}); 