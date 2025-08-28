import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const apiKey = Deno.env.get('RAPIDLEI_API_KEY')
const email = Deno.env.get('RAPIDLEI_EMAIL') 
const baseUrl = Deno.env.get('RAPIDLEI_BASE_URL')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!apiKey || !email || !baseUrl) {
      throw new Error('RapidLEI credentials not properly configured');
    }

    const { leiNumber, formData } = await req.json();
    
    if (!leiNumber || leiNumber.length !== 20) {
      throw new Error('Valid 20-character LEI number is required');
    }

    console.log('Renewing LEI:', leiNumber, 'with updated data:', formData);

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

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('Auth failed:', authError);
      throw new Error(`Authentication failed: ${authResponse.status} - ${authError}`);
    }

    const authData = await authResponse.json();
    console.log('Successfully obtained access token');

    // Step 2: Prepare the renewal payload with all available fields
    const renewalPayload = {
      leiNumber: leiNumber,
      email: formData.contactEmail || undefined,
      phone: formData.contactPhone || undefined,
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      website: formData.website || undefined,
      address: formData.address ? {
        streetAddress: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country
      } : undefined
    };

    // Remove undefined values
    Object.keys(renewalPayload).forEach(key => 
      renewalPayload[key] === undefined && delete renewalPayload[key]
    );

    // Step 3: Make request to RapidLEI API with access token
    const response = await fetch(`${baseUrl}/v1/leis/${leiNumber}/renew`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(renewalPayload),
    });

    console.log('Renewal API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('RapidLEI API error:', response.status, errorText);
      throw new Error(`RapidLEI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('LEI renewal successful:', data);

    return new Response(JSON.stringify({
      success: true,
      leiNumber: data.leiNumber,
      status: data.status,
      orderId: data.orderId,
      newExpirationDate: data.expirationDate,
      message: 'LEI renewal submitted successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in lei-renew function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});