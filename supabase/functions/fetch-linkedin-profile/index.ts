import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { linkedinUrl } = await req.json();

    if (!linkedinUrl) {
      return new Response(
        JSON.stringify({ error: 'LinkedIn URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const LIX_API_KEY = Deno.env.get('LIX_API_KEY');
    if (!LIX_API_KEY) {
      console.error('LIX_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'LinkedIn API is not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Fetching LinkedIn profile:', linkedinUrl);

    // Call Lix API
    const response = await fetch(
      `https://api.lix-it.com/v1/person?profile_link=${encodeURIComponent(linkedinUrl)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': LIX_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lix API error:', response.status, errorText);
      
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ error: 'LinkedIn profile not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Failed to fetch LinkedIn profile' }),
        { 
          status: response.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const data = await response.json();
    console.log('Successfully fetched LinkedIn profile');

    // Extract relevant data and map to our contact format
    const currentExperience = data.experience?.[0]; // Most recent job
    const profileData = {
      name: data.name || '',
      company: currentExperience?.organisation?.name || '',
      role: currentExperience?.title || data.description || '',
      linkedinUrl: data.link || linkedinUrl,
      location: data.location || '',
      // Additional data we might want to store in notes
      bio: data.aboutSummaryText || '',
    };

    return new Response(
      JSON.stringify(profileData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in fetch-linkedin-profile function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
