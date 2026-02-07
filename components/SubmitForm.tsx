import React, { useState, useEffect } from 'react';
import { spotService } from '../services/spotService';
import { youtubeService } from '../services/youtubeService';

interface Props {
    onClose: () => void;
}

const SubmitForm: React.FC<Props> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        youtubeLink: '',
        name: '',
        googleMapsLink: '',
        categories: [] as string[],
        latitude: '',
        longitude: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [isFetchingYoutube, setIsFetchingYoutube] = useState(false);
    const [youtubePreview, setYoutubePreview] = useState<{title: string, thumbnail: string} | null>(null);
    const [isResolvingMaps, setIsResolvingMaps] = useState(false);
    const [mapsError, setMapsError] = useState<string | null>(null);

    // Simplified 3-Category System
    const availableCategories = ["Jajanan", "Makanan Berat", "Minuman/Dessert"];

    const handleCategoryToggle = (cat: string) => {
        setFormData(prev => {
            if (prev.categories.includes(cat)) {
                return { ...prev, categories: prev.categories.filter(c => c !== cat) };
            }
            return { ...prev, categories: [...prev.categories, cat] };
        });
    };

    // Attempt to parse coordinates and extract clean Maps link
    const handleGmapsLinkChange = async (link: string) => {
        let cleanMapsLink = link;
        let lat = '';
        let lng = '';
        setMapsError(null);

        // If it's a YouTube redirect URL, extract the maps link from query param
        if (link.includes('youtube.com/redirect')) {
            const urlMatch = link.match(/[?&]q=([^&]+)/);
            if (urlMatch) {
                cleanMapsLink = decodeURIComponent(urlMatch[1]);
            }
        }

        // Try to extract @lat,lng from standard Google Maps URL
        const atMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (atMatch) {
            lat = atMatch[1];
            lng = atMatch[2];
        }

        // Try place/Name/@lat,lng format
        const placeMatch = link.match(/place\/[^/]+\/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (placeMatch) {
            lat = placeMatch[1];
            lng = placeMatch[2];
        }

        // Try !3d lat !4d lng format (from embed URLs)
        const embedMatch = link.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
        if (embedMatch) {
            lat = embedMatch[1];
            lng = embedMatch[2];
        }

        // Try ll=lat,lng or center=lat,lng format
        const llMatch = link.match(/(?:ll|center)=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (llMatch) {
            lat = llMatch[1];
            lng = llMatch[2];
        }

        // If it's a short link and we don't have coordinates, try to resolve via backend
        const isShort = link.includes('maps.app.goo.gl') || link.includes('goo.gl/maps');
        if (isShort && !lat && !lng) {
            setIsResolvingMaps(true);
            try {
                const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
                const response = await fetch(`${SUPABASE_URL}/functions/v1/resolve-maps-link`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
                    },
                    body: JSON.stringify({ shortUrl: link })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    lat = data.latitude.toString();
                    lng = data.longitude.toString();
                    // Replace short link with full URL
                    cleanMapsLink = data.fullUrl || link;
                } else {
                    setMapsError('Gagal auto-extract koordinat. Silakan isi manual.');
                }
            } catch (error) {
                console.error('Error resolving maps link:', error);
                setMapsError('Gagal terhubung ke server. Silakan isi koordinat manual.');
            }
            setIsResolvingMaps(false);
        }

        setFormData(prev => ({
            ...prev,
            googleMapsLink: cleanMapsLink,
            latitude: lat || prev.latitude,
            longitude: lng || prev.longitude
        }));
    };

    // Auto-fetch YouTube video info when link changes
    const handleYoutubeLinkChange = async (url: string) => {
        setFormData(prev => ({ ...prev, youtubeLink: url }));
        setYoutubePreview(null);
        
        if (!url) return;
        
        const videoId = youtubeService.extractVideoId(url);
        if (videoId) {
            setIsFetchingYoutube(true);
            const info = await youtubeService.fetchVideoInfo(videoId);
            if (info) {
                setYoutubePreview({
                    title: info.title,
                    thumbnail: info.thumbnail
                });
                // Optionally auto-fill name from title
                if (!formData.name) {
                    setFormData(prev => ({ ...prev, name: info.title }));
                }
            }
            setIsFetchingYoutube(false);
        }
    };

    // Check if it's a short link that needs resolving
    const isShortLink = formData.googleMapsLink.includes('maps.app.goo.gl') ||
        formData.googleMapsLink.includes('goo.gl/maps');

    // Open link to get coordinates
    const openAndCopyInstructions = () => {
        window.open(formData.googleMapsLink, '_blank');
        alert('📍 Cara mendapatkan koordinat:\n\n1. Tunggu Google Maps terbuka\n2. Klik kanan di lokasi restoran\n3. Pilih "What\'s here?" atau "Apa ini?"\n4. Lihat angka di bawah (contoh: -6.2345, 106.8456)\n5. Copy angka pertama ke kolom LATITUDE\n6. Copy angka kedua ke kolom LONGITUDE\n\nAtau bisa juga copy dari URL address bar setelah @\n(contoh: google.com/maps/.../@-6.2345,106.8456)');
    };

    // Manual lat/lng input
    const handleLatChange = (val: string) => {
        setFormData(prev => ({ ...prev, latitude: val }));
    };
    const handleLngChange = (val: string) => {
        setFormData(prev => ({ ...prev, longitude: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate lat/lng
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);
        if (!lat || !lng || lat === 0 || lng === 0) {
            alert('Koordinat (Lat/Lng) harus diisi! Masukkan manual jika auto-extract gagal.');
            return;
        }

        setIsSubmitting(true);

        const result = await spotService.create({
            name: formData.name,
            googleMapsUri: formData.googleMapsLink,
            latitude: lat,
            longitude: lng,
            categories: formData.categories,
            youtubeLink: formData.youtubeLink,
        });

        if (result.success) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1000);
        } else {
            alert(result.error || "Gagal menyimpan. Cek console.");
        }

        setIsSubmitting(false);
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">💾</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Tersimpan!</h2>
                <p className="text-gray-500">Spot baru berhasil ditambahkan.</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto animate-slide-up flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10 shadow-sm">
                <h2 className="font-bold text-lg text-gray-800 flex items-center">
                    <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded mr-2 uppercase tracking-wide">Internal</span>
                    Tambah Spot Baru
                </h2>
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="p-6 max-w-lg mx-auto w-full flex-1">
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* YouTube Link - Priority */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Link YouTube (Short/Long/Shorts OK)</label>
                        <input
                            type="url"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                            placeholder="https://youtu.be/... atau https://youtube.com/shorts/..."
                            value={formData.youtubeLink}
                            onChange={e => handleYoutubeLinkChange(e.target.value)}
                        />
                        
                        {/* YouTube Preview */}
                        {isFetchingYoutube && (
                            <div className="mt-2 text-sm text-gray-500 flex items-center">
                                <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                </svg>
                                Mengambil info video...
                            </div>
                        )}
                        
                        {youtubePreview && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex gap-3">
                                    <img 
                                        src={youtubePreview.thumbnail} 
                                        alt="Thumbnail"
                                        className="w-24 h-16 object-cover rounded"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 line-clamp-2">
                                            {youtubePreview.title}
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">✓ Video ditemukan</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Place Name */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Nama Tempat</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange outline-none"
                            placeholder="cth: Nasi Goreng Gila"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Google Maps Link with Auto-Parse */}
                    <div className={`p-4 rounded-xl border ${isShortLink && !formData.latitude ? 'bg-yellow-50 border-yellow-300' : 'bg-blue-50 border-blue-100'}`}>
                        <label className="block text-sm font-bold text-blue-900 mb-1">Google Maps Link</label>
                        <input
                            type="url"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none mb-2"
                            placeholder="https://maps.app.goo.gl/... (auto-detect koordinat)"
                            value={formData.googleMapsLink}
                            onChange={e => handleGmapsLinkChange(e.target.value)}
                        />

                        {/* Loading indicator */}
                        {isResolvingMaps && (
                            <div className="bg-blue-100 border border-blue-400 rounded-lg p-3 mb-3">
                                <div className="flex items-center text-sm text-blue-800">
                                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                    </svg>
                                    Mencari koordinat dari Maps link...
                                </div>
                            </div>
                        )}

                        {/* Success indicator */}
                        {formData.latitude && formData.longitude && (
                            <div className="bg-green-100 border border-green-400 rounded-lg p-3 mb-3">
                                <p className="text-sm text-green-800 font-medium">
                                    ✅ Koordinat ditemukan!<br/>
                                    <span className="text-xs">Lat: {formData.latitude}, Lng: {formData.longitude}</span>
                                    {isShortLink && (
                                        <><br/><span className="text-xs text-green-700">Link Maps diperbarui ke URL lengkap</span></>
                                    )}
                                </p>
                            </div>
                        )}

                        {/* Error indicator */}
                        {mapsError && (
                            <div className="bg-red-100 border border-red-400 rounded-lg p-3 mb-3">
                                <p className="text-sm text-red-800 font-medium">{mapsError}</p>
                                <button
                                    type="button"
                                    onClick={openAndCopyInstructions}
                                    className="mt-2 w-full bg-red-500 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-red-600"
                                >
                                    Buka Google Maps Manual 🗺️
                                </button>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Latitude (cth: -6.2345)"
                                className={`w-1/2 px-3 py-2 text-sm bg-white border rounded ${formData.latitude ? 'border-green-400 text-gray-800' : 'border-red-300 text-gray-500'}`}
                                value={formData.latitude}
                                onChange={e => handleLatChange(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Longitude (cth: 106.8456)"
                                className={`w-1/2 px-3 py-2 text-sm bg-white border rounded ${formData.longitude ? 'border-green-400 text-gray-800' : 'border-red-300 text-gray-500'}`}
                                value={formData.longitude}
                                onChange={e => handleLngChange(e.target.value)}
                            />
                        </div>
                        <p className="text-xs text-blue-600 mt-2">
                            *Short link (maps.app.goo.gl) auto-resolve koordinat via backend<br/>
                            *Kalau gagal auto-resolve, bisa isi manual atau klik "Buka Google Maps Manual"
                        </p>
                    </div>

                    {/* Categories - Simple 3 Options */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Kategori <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {availableCategories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, categories: [cat] }))}
                                    className={`px-3 py-3 rounded-lg text-sm font-bold transition-all border shadow-sm ${formData.categories.includes(cat)
                                        ? 'bg-brand-orange text-white border-brand-orange ring-2 ring-orange-200'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Pilih salah satu. Auto-terisi dari YouTube tags.</p>
                    </div>



                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transform transition-all ${isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gray-900 hover:bg-black hover:scale-[1.02]'
                                }`}
                        >
                            {isSubmitting ? 'Menyimpan...' : 'Simpan ke Database 💾'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitForm;
