import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Location, Restaurant } from '../types';
import { spotService } from '../services/spotService';
import RestaurantCard from './RestaurantCard';
import MapView from './MapView';

interface MapViewRef {
    panToLocation: (lat: number, lng: number) => void;
}

const MapPage: React.FC = () => {
    const [location, setLocation] = useState<Location | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error] = useState<string | null>(null);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [areaSearchQuery, setAreaSearchQuery] = useState<string>('');
    const [isSearchingArea, setIsSearchingArea] = useState<boolean>(false);
    const [recenterTrigger, setRecenterTrigger] = useState<number>(0);
    const [locationReady, setLocationReady] = useState<boolean>(false);
    const watchIdRef = useRef<number | null>(null);
    const mapViewRef = useRef<MapViewRef>(null);

    const loadRestaurants = useCallback(async () => {
        setLoading(true);
        const data = await spotService.getAll();
        setRestaurants(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        if ("geolocation" in navigator) {
            // Use watchPosition for continuous updates, but we only care about the first accurate one
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    console.log("📍 Location update:", latitude, longitude, "accuracy:", accuracy);

                    setLocation({ latitude, longitude });

                    // Once we have a reasonably accurate location (< 100m), stop watching
                    if (accuracy < 100 && !locationReady) {
                        setLocationReady(true);
                        if (watchIdRef.current !== null) {
                            navigator.geolocation.clearWatch(watchIdRef.current);
                        }
                    }

                    // Load restaurants on first location
                    if (!locationReady) {
                        loadRestaurants();
                    }
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    // Fallback to GBK area
                    setLocation({ latitude: -6.2088, longitude: 106.8456 });
                    setLocationReady(true);
                    loadRestaurants();
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        } else {
            setLocation({ latitude: -6.2088, longitude: 106.8456 });
            setLocationReady(true);
            loadRestaurants();
        }

        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [loadRestaurants, locationReady]);

    const filteredRestaurants = restaurants.filter(r => {
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q);
        }
        return true;
    });

    const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (filteredRestaurants.length > 0 && location) {
            setSelectedRestaurantId(filteredRestaurants[0].id);
        }
    };

    // Search area and pan map
    const handleAreaSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!areaSearchQuery.trim()) return;

        setIsSearchingArea(true);
        try {
            // Use OpenStreetMap Nominatim API (free, no key needed)
            const query = encodeURIComponent(`${areaSearchQuery}, Indonesia`);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const latitude = parseFloat(lat);
                const longitude = parseFloat(lon);

                // Pan map to location
                if (mapViewRef.current) {
                    mapViewRef.current.panToLocation(latitude, longitude);
                }
            } else {
                alert('Daerah tidak ditemukan. Coba nama lain (contoh: Setiabudi, Kemang, Bandung, dll)');
            }
        } catch (error) {
            console.error('Area search error:', error);
            alert('Gagal mencari daerah. Coba lagi.');
        } finally {
            setIsSearchingArea(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-50 font-sans flex flex-col overflow-hidden">
            <main className="flex-1 relative w-full h-full">
                {loading && !location ? (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-50">
                        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 text-sm animate-pulse">Mencari tempat makan terdekat...</p>
                    </div>
                ) : location ? (
                    <div className="absolute inset-0 z-0">
                        <MapView
                            ref={mapViewRef}
                            userLocation={location}
                            restaurants={filteredRestaurants}
                            onSelectRestaurant={setSelectedRestaurantId}
                            selectedId={selectedRestaurantId}
                            recenterTrigger={recenterTrigger}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-red-50 text-red-700 p-4 rounded-xl text-center max-w-xs">
                            <p>{error || "Menunggu lokasi..."}</p>
                        </div>
                    </div>
                )}

                {/* Recenter Button - Moved up for mobile + specific Z-Index */}
                {location && (
                    <button
                        onClick={() => setRecenterTrigger(prev => prev + 1)}
                        className={`absolute right-6 z-50 bg-white p-3 rounded-full text-brand-orange shadow-lg hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center border border-gray-100 ${selectedRestaurant ? 'bottom-80' : 'bottom-32'
                            }`}
                        style={{ transition: 'bottom 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        title="Kembali ke Lokasi Saya"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <circle cx="12" cy="12" r="3" strokeWidth={2} />
                            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" strokeWidth={2} />
                        </svg>
                    </button>
                )}

                {/* Area Search - Top Center - Compact */}
                {location && (
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 w-full max-w-xs px-4">
                        <form onSubmit={handleAreaSearch} className="bg-white/95 backdrop-blur-sm rounded-full shadow-md flex items-center overflow-hidden border border-gray-200/80">
                            <div className="pl-3 pr-1">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={areaSearchQuery}
                                onChange={(e) => setAreaSearchQuery(e.target.value)}
                                placeholder="Cari daerah..."
                                className="flex-1 py-2 px-1 text-xs outline-none text-gray-700 bg-transparent"
                            />
                            <button
                                type="submit"
                                disabled={isSearchingArea}
                                className="px-3 py-2 bg-brand-orange text-white font-medium text-xs hover:bg-orange-600 disabled:opacity-50"
                            >
                                {isSearchingArea ? '...' : 'Cari'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Bottom Sheet for Restaurant Details */}
                {selectedRestaurant && (
                    <div className="absolute bottom-0 left-0 right-0 z-50 p-4 pb-10 animate-slide-up">
                        <div className="max-w-md mx-auto relative">
                            <button
                                onClick={() => setSelectedRestaurantId(null)}
                                className="absolute -top-3 right-0 bg-white rounded-full p-1 shadow-md z-10 text-gray-400 hover:text-gray-800"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <RestaurantCard
                                key={selectedRestaurant.id}
                                data={selectedRestaurant}
                                onCheckIn={() => { }}
                                isCheckedIn={false}
                            />
                        </div>
                    </div>
                )}
            </main>

            <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
        </div>
    );
};

export default MapPage;
