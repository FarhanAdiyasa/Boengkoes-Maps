// Supabase Edge Function to resolve Google Maps short links
// File: supabase/functions/resolve-maps-link/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { shortUrl } = await req.json()
    
    if (!shortUrl) {
      return new Response(
        JSON.stringify({ error: 'No URL provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log('Resolving:', shortUrl)

    // Follow redirects to get full URL
    const response = await fetch(shortUrl, {
      method: 'HEAD',
      redirect: 'manual'
    })

    let finalUrl = shortUrl
    
    // Check for redirect
    if (response.status === 301 || response.status === 302) {
      const location = response.headers.get('location')
      if (location) {
        finalUrl = location
        console.log('Redirected to:', finalUrl)
      }
    }

    // Try to extract coordinates from various URL formats
    let latitude = null
    let longitude = null
    let placeName = null

    // Format 1: /@lat,lng
    const atMatch = finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (atMatch) {
      latitude = parseFloat(atMatch[1])
      longitude = parseFloat(atMatch[2])
    }

    // Format 2: place/Name/@lat,lng
    const placeMatch = finalUrl.match(/place\/([^/]+)\/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (placeMatch) {
      placeName = decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ')
      latitude = parseFloat(placeMatch[2])
      longitude = parseFloat(placeMatch[3])
    }

    // Format 3: !3dlat!4dlng (embed format)
    const embedMatch = finalUrl.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
    if (embedMatch) {
      latitude = parseFloat(embedMatch[1])
      longitude = parseFloat(embedMatch[2])
    }

    // Format 4: ll=lat,lng or center=lat,lng
    const llMatch = finalUrl.match(/(?:ll|center)=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (llMatch) {
      latitude = parseFloat(llMatch[1])
      longitude = parseFloat(llMatch[2])
    }

    if (latitude && longitude) {
      return new Response(
        JSON.stringify({
          success: true,
          latitude,
          longitude,
          placeName,
          fullUrl: finalUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Could not extract coordinates from URL',
          fullUrl: finalUrl
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
