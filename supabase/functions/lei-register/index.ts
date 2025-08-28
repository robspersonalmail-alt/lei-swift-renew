import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAPIDLEI_API_KEY = Deno.env.get('RAPIDLEI_API_KEY');
const RAPIDLEI_EMAIL = Deno.env.get('RAPIDLEI_EMAIL');
const RAPIDLEI_BASE_URL = 'https://apistaging.rapidlei.com'; // Staging API URL

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RAPIDLEI_API_KEY || !RAPIDLEI_EMAIL) {
      throw new Error('RapidLEI API key and email not configured');
    }

    const { formData } = await req.json();
    
    console.log('Registering new LEI with data:', formData);

    // First, get access token using correct OAuth2 format
    const authParams = new URLSearchParams();
    authParams.append('grant_type', 'client_credentials');
    authParams.append('client_id', RAPIDLEI_EMAIL);
    authParams.append('client_secret', RAPIDLEI_API_KEY);
    
    const authResponse = await fetch(`${RAPIDLEI_BASE_URL}/v1/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: authParams,
    });

    console.log('Auth response status:', authResponse.status);

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('RapidLEI Auth error:', authResponse.status, authError);
      throw new Error(`RapidLEI Auth error: ${authResponse.status} - ${authError}`);
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;
    console.log('Successfully obtained access token');

    // Prepare the LEI registration request according to RapidLEI API specs
    const registrationPayload = {
      companyName: formData.legalName,
      legalForm: formData.legalForm,
      legalJurisdiction: formData.jurisdiction,
      companyNumber: formData.registrationNumber,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.contactPhone,
      email: formData.contactEmail,
      isLevel2DataAvailable: formData.isLevel2DataAvailable || false,
      multiYearSupport: formData.multiYearSupport || 1,
      reportingExceptionReason: formData.isLevel2DataAvailable ? undefined : "NO_KNOWN_PERSON",
      address: {
        streetAddress: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country
      },
      website: formData.website
    };

    console.log('Sending registration payload:', registrationPayload);

    // Make request to RapidLEI API with Bearer token
    const response = await fetch(`${RAPIDLEI_BASE_URL}/v1/leis/orders/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(registrationPayload),
    });

    console.log('Registration API response status:', response.status);
    console.log('Registration API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RapidLEI API error:', response.status, errorText);
      console.error('Request payload was:', JSON.stringify(registrationPayload, null, 2));
      console.error('Request URL was:', `${RAPIDLEI_BASE_URL}/v1/leis/orders/create`);
      console.error('Access token (first 20 chars):', accessToken ? accessToken.substring(0, 20) + '...' : 'null');
      throw new Error(`RapidLEI API error: ${response.status} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('Registration API response body:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      console.error('Raw response:', responseText);
      throw new Error(`Invalid JSON response from RapidLEI API`);
    }
    console.log('LEI registration successful:', data);

    return new Response(JSON.stringify({
      success: true,
      leiNumber: data.leiNumber,
      status: data.status,
      orderId: data.orderId,
      message: 'LEI registration submitted successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in lei-register function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});