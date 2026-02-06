
import { supabase } from './supabase';
import { Restaurant } from '../types';
import { BOENGKOES_SPOTS } from '../data/spots';

// Map DB snake_case columns to our CamelCase Types
const mapDbToRestaurant = (row: any): Restaurant => {
    const isUserSubmitted = row.description?.includes('User Submitted');

    return {
        id: row.id,
        name: row.name,
        address: row.address,
        rating: parseFloat(row.rating) || 0,
        userRatingCount: row.user_rating_count || 0,
        googleMapsUri: row.google_maps_uri,
        latitude: row.latitude,
        longitude: row.longitude,
        categories: row.categories || [],
        tags: row.tags || [],
        thumbnail: row.thumbnail || '',
        youtubeLink: row.youtube_link || '',
        // Only include boengkoesReview for non-user-submitted items
        boengkoesReview: isUserSubmitted ? undefined : {
            verdict: row.verdict || 'B Aja',
            summary: row.description || '',
            youtubeTimestamp: row.youtube_link || ''
        }
    };
};

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

        // Extract YouTube thumbnail from link
        const extractYouTubeThumbnail = (url: string): string | null => {
            // Handle youtu.be/VIDEO_ID format
            const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
            if (shortMatch) return `https://img.youtube.com/vi/${shortMatch[1]}/maxresdefault.jpg`;

            // Handle youtube.com/watch?v=VIDEO_ID format
            const longMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
            if (longMatch) return `https://img.youtube.com/vi/${longMatch[1]}/maxresdefault.jpg`;

            // Handle youtube.com/embed/VIDEO_ID format
            const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
            if (embedMatch) return `https://img.youtube.com/vi/${embedMatch[1]}/maxresdefault.jpg`;

            return null;
        };

        const thumbnail = extractYouTubeThumbnail(spot.youtubeLink);

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
                thumbnail: thumbnail,
                description: "User Submitted - Pending Review",
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
