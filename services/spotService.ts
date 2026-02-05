
import { supabase } from './supabase';
import { Restaurant } from '../types';
import { BOENGKOES_SPOTS } from '../data/spots';

// Map DB snake_case columns to our CamelCase Types
const mapDbToRestaurant = (row: any): Restaurant => ({
    id: row.id,
    name: row.name,
    address: row.address,
    rating: row.rating,
    userRatingCount: row.user_rating_count,
    googleMapsUri: row.google_maps_uri,
    latitude: row.latitude,
    longitude: row.longitude,
    categories: row.categories || [],
    tags: row.tags || [],
    thumbnail: row.thumbnail || '',
    // Construct the review object
    boengkoesReview: {
        verdict: row.verdict || 'B Aja',
        summary: row.description || '',
        youtubeTimestamp: row.youtube_link || ''
    }
});

export const spotService = {
    async getAll(): Promise<Restaurant[]> {
        // Strict Mode: Only use Supabase
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            console.error("Supabase keys missing! Please check your .env file.");
            return []; // No fallback
        }

        const { data, error } = await supabase
            .from('spots')
            .select('*');

        if (error) {
            console.error('Error fetching spots from Supabase:', error);
            return []; // No fallback
        }

        if (!data || data.length === 0) return [];

        return data.map(mapDbToRestaurant);
    },

    async create(spot: Partial<Restaurant> & { youtubeLink: string, verdict: string }): Promise<boolean> {
        if (!import.meta.env.VITE_SUPABASE_URL) {
            console.log("Mock Submit (No DB):", spot);
            return true;
        }

        const { error } = await supabase
            .from('spots')
            .insert({
                name: spot.name,
                address: spot.address || '',
                google_maps_uri: spot.googleMapsUri,
                latitude: spot.latitude,
                longitude: spot.longitude,
                categories: spot.categories,
                tags: spot.tags,
                youtube_link: spot.youtubeLink,
                verdict: spot.verdict,
                description: "User Submitted - Pending Review", // Default placeholder
                rating: 0,
                user_rating_count: 0
            });

        if (error) {
            console.error("Submit Error:", error);
            return false;
        }
        return true;
    }
};
