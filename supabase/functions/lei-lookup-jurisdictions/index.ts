import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const apiKey = Deno.env.get('RAPIDLEI_API_KEY')
const email = Deno.env.get('RAPIDLEI_EMAIL') 
const baseUrl = Deno.env.get('RAPIDLEI_BASE_URL')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Querying supported jurisdictions from RapidLEI API...');

    // Step 1: Get access token
    const authResponse = await fetch(`${baseUrl}/v1/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: email,
        client_secret: apiKey,
      }),
    });

    console.log('Auth response status:', authResponse.status);

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('Auth failed:', authError);
      throw new Error(`Authentication failed: ${authResponse.status} - ${authError}`);
    }

    const authData = await authResponse.json();
    console.log('Successfully obtained access token');

    // Step 2: Query supported jurisdictions
    const jurisdictionsResponse = await fetch(`${baseUrl}/v1/leis/query/jurisdictions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Jurisdictions query response status:', jurisdictionsResponse.status);

    if (!jurisdictionsResponse.ok) {
      const jurisdictionsError = await jurisdictionsResponse.text();
      console.error('Jurisdictions query failed:', jurisdictionsResponse.status, jurisdictionsError);
      throw new Error(`Failed to query jurisdictions: ${jurisdictionsResponse.status} - ${jurisdictionsError}`);
    }

    const jurisdictionsData = await jurisdictionsResponse.json();
    console.log('Supported jurisdictions retrieved successfully');
    console.log('Jurisdictions data:', JSON.stringify(jurisdictionsData, null, 2));

    return new Response(JSON.stringify({
      success: true,
      jurisdictions: jurisdictionsData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in lei-lookup function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});