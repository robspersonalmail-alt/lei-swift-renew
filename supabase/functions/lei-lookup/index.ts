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

    const { leiNumber } = await req.json();
    
    if (!leiNumber || leiNumber.length !== 20) {
      throw new Error('Valid 20-character LEI number is required');
    }

    console.log('Looking up LEI:', leiNumber);

    // Make request to RapidLEI API to lookup LEI
    const response = await fetch(`${RAPIDLEI_BASE_URL}/lei/${leiNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${RAPIDLEI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('LEI number not found');
      }
      const errorText = await response.text();
      console.error('RapidLEI API error:', response.status, errorText);
      throw new Error(`RapidLEI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('LEI lookup successful:', data);

    return new Response(JSON.stringify({
      success: true,
      entityData: {
        legalName: data.legalName,
        legalForm: data.legalForm,
        jurisdiction: data.jurisdiction,
        registrationNumber: data.registrationNumber,
        status: data.status,
        expirationDate: data.expirationDate,
        address: data.address
      }
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