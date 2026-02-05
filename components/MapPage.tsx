import React, { useState, useEffect, useCallback } from 'react';
import { Location, Restaurant } from '../types';
import { spotService } from '../services/spotService';
import RestaurantCard from './RestaurantCard';
import MapView from './MapView';

const MapPage: React.FC = () => {
    const [location, setLocation] = useState<Location | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error] = useState<string | null>(null);
    const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [recenterTrigger, setRecenterTrigger] = useState<number>(0);

    const loadRestaurants = useCallback(async () => {
        setLoading(true);
        const data = await spotService.getAll();
        setRestaurants(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log("📍 Got real location:", latitude, longitude);
                    setLocation({ latitude, longitude });
                    loadRestaurants();
                },
                (err) => {
                    console.error("Geolocation error:", err);
                    setLocation({ latitude: -6.2088, longitude: 106.8456 });
                    loadRestaurants();
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        } else {
            setLocation({ latitude: -6.2088, longitude: 106.8456 });
            loadRestaurants();
        }
    }, [loadRestaurants]);

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

    return (
        <div className="h-screen w-screen bg-gray-50 font-sans flex flex-col overflow-hidden relative">
            {/* Header with Search */}
            <header className="absolute top-0 left-0 right-0 z-50 pointer-events-none flex flex-col items-center pt-2 gap-2">
                <div className="w-full max-w-md px-4 pointer-events-auto">
                    <form onSubmit={handleSearchSubmit} className="relative shadow-lg rounded-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400">🔍</span>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 rounded-full border-none focus:ring-2 focus:ring-brand-orange bg-white/95 backdrop-blur-sm text-sm"
                            placeholder="Cari 'Nasi Goreng' atau 'Jaksel'..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>
            </header>

            <main className="flex-1 relative">
                {loading && !location ? (
                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-50">
                        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 text-sm animate-pulse">Locating closest eats...</p>
                    </div>
                ) : location ? (
                    <div className="absolute inset-0 z-0">
                        <MapView
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
                            <p>{error || "Waiting for location..."}</p>
                        </div>
                    </div>
                )}

                {/* Recenter Button */}
                {location && (
                    <button
                        onClick={() => setRecenterTrigger(prev => prev + 1)}
                        className="absolute bottom-6 right-6 z-40 bg-white p-3 rounded-full text-brand-orange shadow-lg hover:bg-gray-50 transition-transform active:scale-95 flex items-center justify-center"
                        title="Recenter"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <circle cx="12" cy="12" r="3" strokeWidth={2} />
                            <path d="M12 2v2M12 20v2M2 12h2M20 12h2" strokeWidth={2} />
                        </svg>
                    </button>
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
