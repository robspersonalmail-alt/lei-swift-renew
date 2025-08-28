import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAPIDLEI_API_KEY = Deno.env.get('RAPIDLEI_API_KEY');
const RAPIDLEI_EMAIL = Deno.env.get('RAPIDLEI_EMAIL');
const RAPIDLEI_BASE_URL = 'https://apistaging.rapidlei.com';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RAPIDLEI_API_KEY || !RAPIDLEI_EMAIL) {
      throw new Error('RapidLEI API key and email not configured');
    }

    console.log('Testing RapidLEI authentication...');
    console.log('Email:', RAPIDLEI_EMAIL);
    console.log('API Key (first 10 chars):', RAPIDLEI_API_KEY?.substring(0, 10));
    console.log('API Key (last 5 chars):', RAPIDLEI_API_KEY?.slice(-5));

    // Test OAuth2 authentication
    const authParams = new URLSearchParams();
    authParams.append('apiKey', RAPIDLEI_API_KEY);
    authParams.append('email', RAPIDLEI_EMAIL);
    
    console.log('Auth parameters:', {
      grant_type: 'client_credentials',
      client_id: RAPIDLEI_EMAIL,
      client_secret: RAPIDLEI_API_KEY?.substring(0, 10) + '...'
    });
    
    const authResponse = await fetch(`${RAPIDLEI_BASE_URL}/v1/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: authParams,
    });

    console.log('Auth response status:', authResponse.status);
    console.log('Auth response headers:', Object.fromEntries(authResponse.headers.entries()));

    const responseText = await authResponse.text();
    console.log('Auth response body:', responseText);

    if (!authResponse.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: `Authentication failed: ${authResponse.status} - ${responseText}`,
        debug: {
          status: authResponse.status,
          headers: Object.fromEntries(authResponse.headers.entries()),
          body: responseText
        }
      }), {
        status: 200, // Return 200 so we can see the debug info
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let authData;
    try {
      authData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse auth response as JSON:', e);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }

    console.log('Authentication successful!', authData);

    return new Response(JSON.stringify({
      success: true,
      message: 'Authentication successful!',
      data: authData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in lei-test-auth function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});