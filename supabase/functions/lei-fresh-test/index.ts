import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAPIDLEI_API_KEY = Deno.env.get('RAPIDLEI_API_KEY');
    const RAPIDLEI_EMAIL = Deno.env.get('RAPIDLEI_EMAIL');
    
    console.log('Fresh test - API key exists:', !!RAPIDLEI_API_KEY);
    console.log('Fresh test - Email exists:', !!RAPIDLEI_EMAIL);
    console.log('Fresh test - Email value:', RAPIDLEI_EMAIL);
    console.log('Fresh test - API key first 10 chars:', RAPIDLEI_API_KEY?.substring(0, 10));

    if (!RAPIDLEI_API_KEY || !RAPIDLEI_EMAIL) {
      throw new Error('Missing credentials');
    }

    // Use correct OAuth2 format as per RapidLEI documentation
    const authParams = new URLSearchParams();
    authParams.append('grant_type', 'client_credentials');
    authParams.append('client_id', RAPIDLEI_EMAIL);
    authParams.append('client_secret', RAPIDLEI_API_KEY);
    
    console.log('Attempting authentication with staging API...');
    
    const response = await fetch('https://apistaging.rapidlei.com/v1/auth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: authParams,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);

    return new Response(JSON.stringify({
      success: response.ok,
      status: response.status,
      body: responseText,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Fresh test error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});