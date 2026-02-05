import { GoogleGenAI, Type } from "@google/genai";
import { Restaurant, Review } from "../types";

// Helper to generate random coordinates near a location (for demo mapping)
function getRandomOffset(lat: number, lng: number, radiusInKm: number = 2) {
  const r = radiusInKm / 111.32; // approximate degrees
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);
  
  // Adjust for longitude shrinking
  const xAdjusted = x / Math.cos(lat * (Math.PI / 180));
  
  return {
    latitude: lat + y,
    longitude: lng + xAdjusted
  };
}

export const findNearbyBoengkoesSpots = async (lat: number, lng: number): Promise<Restaurant[]> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing");
    return [];
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 1. Use Gemini with Maps Grounding to find real places
  const prompt = `Find 5 popular local street food or legendary restaurants near latitude ${lat}, longitude ${lng}. Focus on places that have high ratings and might be viral.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng
            }
          }
        }
      },
    });

    const candidates = response.candidates;
    const groundingChunks = candidates?.[0]?.groundingMetadata?.groundingChunks;

    if (!groundingChunks) {
      return [];
    }

    const restaurants: Restaurant[] = [];

    for (const chunk of groundingChunks) {
      if (chunk.web) continue; 

      const c = chunk as any; 
      const mapData = c.maps || c.web;

      if (mapData && mapData.title) {
        const isViral = Math.random() > 0.5;
        const verdict = isViral ? "Ngaco Enaknya!" : "Oke buat tanggal tua";
        
        // IMPORTANT: In a real production app with the Places API, we would get exact coords.
        // For this demo/prototype using GenAI text chunks, we simulate the location nearby 
        // to ensure the User Experience of seeing pins on the map works.
        const coords = getRandomOffset(lat, lng);

        restaurants.push({
          id: mapData.placeId || Math.random().toString(36).substr(2, 9),
          name: mapData.title,
          address: "Dekat lokasi anda", 
          rating: 4.5 + (Math.random() * 0.5),
          userRatingCount: Math.floor(Math.random() * 1000) + 100,
          googleMapsUri: mapData.uri,
          distance: "0.5 km",
          latitude: coords.latitude,
          longitude: coords.longitude,
          boengkoesReview: {
            verdict: verdict,
            summary: `Gokil sih ini. ${mapData.title} bumbunya medok banget. Gue pesen menu andalannya, rasanya meledak di mulut. Wajib cobain!`,
            youtubeTimestamp: "https://youtube.com/user/boengkoes"
          }
        });
      }
    }

    return restaurants;

  } catch (error) {
    console.error("Error fetching places:", error);
    return [];
  }
};