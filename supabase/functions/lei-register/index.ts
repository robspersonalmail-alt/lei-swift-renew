import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAPIDLEI_API_KEY = Deno.env.get('RAPIDLEI_API_KEY');
const RAPIDLEI_EMAIL = Deno.env.get('RAPIDLEI_EMAIL');
const RAPIDLEI_BASE_URL = 'https://api.rapidlei.com'; // Base URL from RapidLEI API

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

    // Prepare the LEI registration request according to RapidLEI API specs
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

    console.log('Sending registration payload:', registrationPayload);
    console.log('Using API Key (first 10 chars):', RAPIDLEI_API_KEY?.substring(0, 10));
    console.log('Using Email:', RAPIDLEI_EMAIL);

    // Try Basic authentication with API key
    const authString = btoa(`${RAPIDLEI_EMAIL}:${RAPIDLEI_API_KEY}`);
    
    const response = await fetch(`${RAPIDLEI_BASE_URL}/v1/leis/orders/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(registrationPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RapidLEI API error:', response.status, errorText);
      throw new Error(`RapidLEI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
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