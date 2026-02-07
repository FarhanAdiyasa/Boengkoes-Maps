
import { supabase } from './supabase';
import { Restaurant } from '../types';
import { BOENGKOES_SPOTS } from '../data/spots';

// Map DB snake_case columns to our CamelCase Types
const mapDbToRestaurant = (row: any): Restaurant => {
    return {
        id: row.id,
        name: row.name,
        googleMapsUri: row.google_maps_uri,
        latitude: row.latitude,
        longitude: row.longitude,
        categories: row.categories || [],
        tags: row.tags || [],
        thumbnail: row.thumbnail || '',
        youtubeLink: row.youtube_link || ''
    };
};

export const spotService = {
    async getAll(): Promise<Restaurant[]> {
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            console.error("Supabase keys missing!");
            return [];
        }

        const { data, error } = await supabase
            .from('spots')
            .select('*');

        if (error) {
            console.error('Error fetching spots from Supabase:', error);
            return [];
        }

        return data?.map(mapDbToRestaurant) || [];
    },

    async create(spot: Partial<Restaurant>): Promise<{ success: boolean, error?: string }> {
        if (!import.meta.env.VITE_SUPABASE_URL) return { success: true };

        // 1. Check if the Maps Link already exists
        const { data: existing } = await supabase
            .from('spots')
            .select('id, name')
            .eq('google_maps_uri', spot.googleMapsUri)
            .maybeSingle();

        if (existing) {
            return {
                success: false,
                error: `Gagal! Tempat ini sudah terdaftar dengan nama "${existing.name}".`
            };
        }

        const extractYouTubeThumbnail = (url: string): string | null => {
            const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
            if (shortMatch) return `https://img.youtube.com/vi/${shortMatch[1]}/hqdefault.jpg`;

            const longMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
            if (longMatch) return `https://img.youtube.com/vi/${longMatch[1]}/hqdefault.jpg`;

            return null;
        };

        const thumbnail = spot.youtubeLink ? extractYouTubeThumbnail(spot.youtubeLink) : null;

        const { error } = await supabase
            .from('spots')
            .insert({
                name: spot.name,
                google_maps_uri: spot.googleMapsUri,
                latitude: spot.latitude,
                longitude: spot.longitude,
                categories: spot.categories,
                tags: spot.tags,
                youtube_link: spot.youtubeLink,
                thumbnail: thumbnail
            });

        if (error) {
            console.error("Submit Error:", error);
            return { success: false, error: "Terjadi kesalahan sistem saat menyimpan." };
        }
        return { success: true };
    }
};
