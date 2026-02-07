export interface Location {
  latitude: number;
  longitude: number;
}

export interface Restaurant {
  id: string;
  name: string;
  googleMapsUri: string;
  thumbnail?: string;
  youtubeLink?: string;
  latitude: number;
  longitude: number;
  categories?: string[];
  tags?: string[];
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