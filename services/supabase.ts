
import { createClient } from '@supabase/supabase-js';
// import { Database } from '../types/supabase'; // We will generate this type later or use strict typing

// Create a single supabase client for interacting with your database
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ Supabase Keys missing! The application will not be able to fetch or save research data. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.");
}

// Create a single supabase client for interacting with your database
// We use a dummy URL if missing to avoid immediate crash, but logic should check for existence
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder'
);
