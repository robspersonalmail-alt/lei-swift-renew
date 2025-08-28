import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAPIDLEI_API_KEY = Deno.env.get('RAPIDLEI_API_KEY');
const RAPIDLEI_BASE_URL = 'https://api.rapidlei.com';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RAPIDLEI_API_KEY) {
      throw new Error('RapidLEI API key not configured');
    }

    const { leiNumber, formData } = await req.json();
    
    if (!leiNumber || leiNumber.length !== 20) {
      throw new Error('Valid 20-character LEI number is required');
    }

    console.log('Renewing LEI:', leiNumber, 'with updated data:', formData);

    // Prepare the LEI renewal request according to RapidLEI API specs
    const renewalPayload = {
      leiNumber: leiNumber,
      contactEmail: formData.contactEmail,
      website: formData.website || undefined,
      updatedAddress: formData.address ? {
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

    // Make request to RapidLEI API
    const response = await fetch(`${RAPIDLEI_BASE_URL}/v1/leis/${leiNumber}/renew`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RAPIDLEI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(renewalPayload),
    });

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