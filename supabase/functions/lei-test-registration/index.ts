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
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RAPIDLEI_API_KEY || !RAPIDLEI_EMAIL) {
      throw new Error('RapidLEI API key and email not configured');
    }

    const { formData } = await req.json();
    console.log('Testing LEI registration with data:', formData);

    // Step 1: Authentication (same as working test)
    console.log('Step 1: Testing authentication...');
    const authParams = new URLSearchParams();
    authParams.append('apiKey', RAPIDLEI_API_KEY);
    authParams.append('email', RAPIDLEI_EMAIL);
    
    const authResponse = await fetch(`${RAPIDLEI_BASE_URL}/v1/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: authParams,
    });

    console.log('Auth response status:', authResponse.status);
    const authResponseText = await authResponse.text();
    console.log('Auth response body:', authResponseText);

    if (!authResponse.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: `Authentication failed: ${authResponse.status} - ${authResponseText}`,
        step: 'authentication'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authData = JSON.parse(authResponseText);
    const accessToken = authData.accessToken;
    console.log('Authentication successful, got token');

    // Step 2: LEI Registration
    console.log('Step 2: Testing LEI registration...');
    const registrationPayload = {
      legalName: formData.legalName,
      legalForm: formData.legalForm,
      jurisdiction: formData.jurisdiction,
      registrationNumber: formData.registrationNumber,
      address: {
        streetAddress: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country
      },
      contactEmail: formData.contactEmail,
      website: formData.website
    };

    console.log('Sending registration payload:', JSON.stringify(registrationPayload, null, 2));

    const response = await fetch(`${RAPIDLEI_BASE_URL}/v1/leis/orders/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(registrationPayload),
    });

    console.log('Registration response status:', response.status);
    const responseText = await response.text();
    console.log('Registration response body:', responseText);

    if (!response.ok) {
      return new Response(JSON.stringify({
        success: false,
        error: `Registration failed: ${response.status} - ${responseText}`,
        step: 'registration',
        payload: registrationPayload
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = JSON.parse(responseText);
    console.log('LEI registration successful:', data);

    return new Response(JSON.stringify({
      success: true,
      message: 'LEI registration test successful!',
      data: data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in lei-test-registration function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      step: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});