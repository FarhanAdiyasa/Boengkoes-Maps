import React, { useState, useEffect, useCallback } from 'react';
import { Location, Restaurant, AppView } from './types';
import { spotService } from './services/spotService';
import RestaurantCard from './components/RestaurantCard';
import SubmitForm from './components/SubmitForm';
import MapView from './components/MapView';



const App: React.FC = () => {
  // Simplification: VIEW only needed if we add other screens back. For now, it's just MAP.
  const [view] = useState<AppView>(AppView.DISCOVERY);
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const [location, setLocation] = useState<Location | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error] = useState<string | null>(null);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  // New States: Search and Filter
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recenterTrigger, setRecenterTrigger] = useState<number>(0);

  // Fixed Filter Options
  const TAG_FILTERS = ["All", "LWK", "Ancyurr"];
  const CATEGORY_FILTERS = ["All", "Makanan Berat", "Ringan", "Minuman"];

  // Load Data
  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    const data = await spotService.getAll();
    setRestaurants(data);
    setLoading(false);
  }, []);

  // Initialize Location
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
          // Fallback to Jakarta center after error
          setLocation({ latitude: -6.2088, longitude: 106.8456 }); // GBK area
          loadRestaurants();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000, // Wait up to 10 seconds for accurate location
          maximumAge: 0
        }
      );
    } else {
      setLocation({ latitude: -6.2088, longitude: 106.8456 });
      loadRestaurants();
    }
  }, [loadRestaurants]);

  // Derived State: Filtering Logic
  const filteredRestaurants = restaurants.filter(r => {
    // 1. Tag Filter
    if (selectedTag !== 'All') {
      if (!r.tags || !r.tags.includes(selectedTag)) return false;
    }

    // 2. Category Filter
    if (selectedCategory !== 'All') {
      if (!r.categories || !r.categories.includes(selectedCategory)) return false;
    }

    // 3. Search Query (Name or Address)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.address.toLowerCase().includes(q);
    }

    return true;
  });

  const selectedRestaurant = restaurants.find(r => r.id === selectedRestaurantId);

  // Simple "Search Location" Handler (basic string match for now, simulating 'Jump')
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredRestaurants.length > 0 && location) {
      // In a real app with MapRef, we would flyTo(filteredRestaurants[0])
      setSelectedRestaurantId(filteredRestaurants[0].id);
    }
  };

  const renderHeader = () => (
    <header className="absolute top-0 left-0 right-0 z-50 pointer-events-none flex flex-col items-center pt-2 gap-2">
      {/* Search Bar */}
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

      {/* Filter Chips - Hidden for now as data has generic tags */}
      {/* 
      <div className="w-full max-w-md px-4 pointer-events-auto overflow-x-auto no-scrollbar pb-2">
        ... filters ...
      </div> 
      */}
    </header>
  );

  return (
    <div className="h-screen w-screen bg-gray-50 font-sans flex flex-col overflow-hidden relative">
      {renderHeader()}

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
            className="absolute bottom-24 right-6 z-40 bg-white p-3 rounded-full text-brand-orange shadow-lg hover:bg-gray-50 transition-transform active:scale-95 flex items-center justify-center"
            title="Recenter"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <circle cx="12" cy="12" r="3" strokeWidth={2} />
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2" strokeWidth={2} />
            </svg>
          </button>
        )}

        {/* Floating Action Button for Submit */}
        <button
          onClick={() => setShowSubmitForm(true)}
          className="absolute bottom-6 right-6 z-40 bg-brand-red p-4 rounded-full text-white shadow-xl hover:bg-red-700 transition-transform hover:scale-105 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>

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
                onCheckIn={() => { }} // Disabled for now
                isCheckedIn={false}
              />
            </div>
          </div>
        )}

        {/* Submit Form Overlay */}
        {showSubmitForm && (
          <SubmitForm onClose={() => setShowSubmitForm(false)} />
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
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;