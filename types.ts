export interface Location {
  latitude: number;
  longitude: number;
}

export interface Review {
  verdict: string; // e.g., "Ngaco Enaknya!", "B aja"
  summary: string;
  youtubeTimestamp: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating: number; // Google Rating
  userRatingCount: number;
  priceLevel?: string;
  googleMapsUri: string;
  photoUri?: string;
  thumbnail?: string; // YouTube thumbnail URL
  youtubeLink?: string; // YouTube video link
  distance?: string;
  latitude: number;
  longitude: number;
  boengkoesReview?: Review; // Simulated review from Boengkoes persona
  categories?: string[]; // e.g., ["Makanan Berat", "Minuman"]
  tags?: string[]; // e.g., ["LWK", "Ancyurr"]
}

export interface UserStats {
  checkIns: string[]; // List of Restaurant IDs
  level: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export enum AppView {
  DISCOVERY = 'DISCOVERY',
  PROFILE = 'PROFILE',
  DETAILS = 'DETAILS'
}