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
    const { linkedinUrl, name, company } = await req.json();

    if (!linkedinUrl && !name) {
      return new Response(
        JSON.stringify({ error: 'Either LinkedIn URL or name is required' }),
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

    let response;
    let apiUrl: string;

    if (linkedinUrl) {
      // Fetch by LinkedIn URL
      console.log('Fetching LinkedIn profile by URL:', linkedinUrl);
      apiUrl = `https://api.lix-it.com/v1/person?profile_link=${encodeURIComponent(linkedinUrl)}`;
    } else {
      // Search by name and company
      console.log('Searching LinkedIn profile by name:', name, 'company:', company);
      const params = new URLSearchParams({ name: name! });
      if (company) {
        params.append('company', company);
      }
      apiUrl = `https://api.lix-it.com/v1/search/person?${params.toString()}`;
    }

    response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': LIX_API_KEY,
      },
    });

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

    // Handle search results vs direct profile fetch
    let profileData;
    
    if (Array.isArray(data) && data.length > 0) {
      // Search API returns an array, use the first result
      const profile = data[0];
      const currentExperience = profile.experience?.[0];
      profileData = {
        name: profile.name || '',
        company: currentExperience?.organisation?.name || '',
        role: currentExperience?.title || profile.description || '',
        linkedinUrl: profile.link || '',
        location: profile.location || '',
        bio: profile.aboutSummaryText || '',
      };
    } else if (Array.isArray(data) && data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No LinkedIn profile found matching the search criteria' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Direct profile fetch returns an object
      const currentExperience = data.experience?.[0];
      profileData = {
        name: data.name || '',
        company: currentExperience?.organisation?.name || '',
        role: currentExperience?.title || data.description || '',
        linkedinUrl: data.link || linkedinUrl || '',
        location: data.location || '',
        bio: data.aboutSummaryText || '',
      };
    }

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
