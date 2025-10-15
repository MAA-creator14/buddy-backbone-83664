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
      
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': LIX_API_KEY,
        },
      });
    } else {
      // Search by name and company using LinkedIn search URL
      console.log('Searching LinkedIn profile by name:', name, 'company:', company);
      
      // Build LinkedIn search URL
      const keywords = company ? `${name} ${company}` : name;
      const linkedinSearchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(keywords!)}`;
      
      console.log('LinkedIn search URL:', linkedinSearchUrl);
      
      apiUrl = `https://api.lix-it.com/v1/li/linkedin/search/people?url=${encodeURIComponent(linkedinSearchUrl)}`;
      
      response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': LIX_API_KEY,
        },
      });
    }

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
    console.log('Successfully fetched LinkedIn profile data');
    console.log('Raw API response:', JSON.stringify(data, null, 2));

    // Handle search results vs direct profile fetch
    let profileData;
    
    if (data.searchResponse && data.searchResponse.people) {
      // LinkedIn search API returns searchResponse with people array
      const people = data.searchResponse.people;
      
      if (people.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No LinkedIn profile found matching the search criteria' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Use the first result
      const profile = people[0];
      const currentExperience = profile.experience?.[0];
      
      profileData = {
        name: profile.name || '',
        company: currentExperience?.organisation?.name || profile.currentPositions?.[0]?.companyName || '',
        role: currentExperience?.title || profile.currentPositions?.[0]?.title || profile.headline || '',
        linkedinUrl: profile.profileLink || `https://www.linkedin.com/in/${profile.publicIdentifier || ''}`,
        location: profile.location || '',
        bio: profile.summary || '',
      };
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

    console.log('Profile data to return:', JSON.stringify(profileData, null, 2));

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
