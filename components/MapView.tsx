import React, { useEffect, useRef } from 'react';
import { Location, Restaurant } from '../types';

interface Props {
  userLocation: Location;
  restaurants: Restaurant[];
  onSelectRestaurant: (id: string) => void;
  selectedId: string | null;
  recenterTrigger: number;
}

declare global {
  interface Window {
    L: any;
  }
}

const MapView: React.FC<Props> = ({ userLocation, restaurants, onSelectRestaurant, selectedId, recenterTrigger }) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  const userMarkerRef = useRef<any>(null);
  const lastLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const isFirstRenderRef = useRef<boolean>(true);

  // User icon style (defined once)
  const userIconHtml = `
    <div style="
      width: 20px;
      height: 20px;
      background-color: #3B82F6;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 4px 6px rgba(0, 0, 0, 0.3);
      animation: pulse 2s infinite;
    "></div>
    <style>
      @keyframes pulse {
        0%, 100% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 4px 6px rgba(0, 0, 0, 0.3); }
        50% { box-shadow: 0 0 0 16px rgba(59, 130, 246, 0.1), 0 4px 6px rgba(0, 0, 0, 0.3); }
      }
    </style>
  `;

  // Calculate distance between two points in meters
  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    if (!mapRef.current) {
      // Initialize map
      mapRef.current = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([userLocation.latitude, userLocation.longitude], 15);

      // Add Tile Layer
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(mapRef.current);

      // Create User Marker
      const userIcon = window.L.divIcon({
        className: 'user-marker-icon',
        html: userIconHtml,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
      userMarkerRef.current = window.L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon }).addTo(mapRef.current);
      lastLocationRef.current = { lat: userLocation.latitude, lng: userLocation.longitude };
      isFirstRenderRef.current = false;
    } else {
      // Update user marker position
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.latitude, userLocation.longitude]);

        // Only update reference, DO NOT flyTo automatically anymore.
        lastLocationRef.current = { lat: userLocation.latitude, lng: userLocation.longitude };
      }
    }

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker: any) => marker.remove());
    markersRef.current = {};

    // Add Restaurant Markers
    restaurants.forEach(restaurant => {
      const isSelected = restaurant.id === selectedId;

      let color = 'bg-brand-orange';

      if (isSelected) {
        color = 'bg-black ring-4 ring-brand-orange';
      }

      const pinHtml = `
        <div class="relative group transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'scale-100'}" style="width: 80px; margin-left: -24px;">
            <div class="w-8 h-8 rounded-full ${color} flex items-center justify-center text-white shadow-lg border-2 border-white transform transition-transform mx-auto">
               ${isSelected ? '★' : '🍔'}
            </div>
            <div class="text-center mt-1">
              <span class="text-xs font-semibold text-gray-800 bg-white/90 px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap" style="font-size: 10px; max-width: 80px; overflow: hidden; text-overflow: ellipsis; display: inline-block;">
                ${restaurant.name.length > 12 ? restaurant.name.substring(0, 12) + '...' : restaurant.name}
              </span>
            </div>
        </div>
      `;

      const icon = window.L.divIcon({
        className: 'custom-pin',
        html: pinHtml,
        iconSize: [32, 40],
        iconAnchor: [16, 40]
      });

      const marker = window.L.marker([restaurant.latitude, restaurant.longitude], { icon })
        .addTo(mapRef.current)
        .on('click', () => {
          onSelectRestaurant(restaurant.id);
          // Pan to marker slightly offset to accommodate bottom sheet
          mapRef.current.flyTo([restaurant.latitude - 0.002, restaurant.longitude], 16, {
            animate: true,
            duration: 0.5
          });
        });

      markersRef.current[restaurant.id] = marker;
    });

  }, [userLocation, restaurants, selectedId, onSelectRestaurant]);

  // Handle Recenter
  useEffect(() => {
    if (mapRef.current && userLocation && recenterTrigger > 0) {
      mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], 15, {
        animate: true,
        duration: 1
      });
    }
  }, [recenterTrigger, userLocation]);

  return (
    <div ref={mapContainerRef} className="w-full h-full bg-gray-100" />
  );
};

export default MapView;