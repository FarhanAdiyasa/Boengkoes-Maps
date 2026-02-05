import React, { useState } from 'react';
import { spotService } from '../services/spotService';

interface Props {
    onClose: () => void;
}

const SubmitForm: React.FC<Props> = ({ onClose }) => {
    const [formData, setFormData] = useState({
        youtubeLink: '',
        name: '',
        googleMapsLink: '',
        categories: [] as string[],
        tags: [] as string[],
        latitude: '',
        longitude: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Restricted Tags for Internal Tool
    const availableTags = ["LWK", "Ancyurr"];
    const availableCategories = ["Makanan Berat", "Ringan", "Minuman"];

    const handleTagToggle = (tag: string) => {
        setFormData(prev => {
            if (prev.tags.includes(tag)) {
                return { ...prev, tags: prev.tags.filter(t => t !== tag) };
            }
            return { ...prev, tags: [...prev.tags, tag] };
        });
    };

    const handleCategoryToggle = (cat: string) => {
        setFormData(prev => {
            if (prev.categories.includes(cat)) {
                return { ...prev, categories: prev.categories.filter(c => c !== cat) };
            }
            return { ...prev, categories: [...prev.categories, cat] };
        });
    };

    // Attempt to parse coordinates and extract clean Maps link
    const handleGmapsLinkChange = (link: string) => {
        let cleanMapsLink = link;
        let lat = '';
        let lng = '';

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

        setFormData(prev => ({
            ...prev,
            googleMapsLink: cleanMapsLink,
            latitude: lat || prev.latitude,
            longitude: lng || prev.longitude
        }));
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

        const success = await spotService.create({
            name: formData.name,
            googleMapsUri: formData.googleMapsLink,
            latitude: lat,
            longitude: lng,
            categories: formData.categories,
            tags: formData.tags,
            youtubeLink: formData.youtubeLink,
            verdict: "User Submission",
        });

        if (success) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1000);
        } else {
            alert("Gagal menyimpan. Cek console.");
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
                        <label className="block text-sm font-bold text-gray-700 mb-1">Link YouTube / Timestamp</label>
                        <input
                            type="url"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-orange focus:border-transparent outline-none"
                            placeholder="https://youtu.be/..."
                            value={formData.youtubeLink}
                            onChange={e => setFormData({ ...formData, youtubeLink: e.target.value })}
                        />
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
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <label className="block text-sm font-bold text-blue-900 mb-1">Google Maps Link</label>
                        <input
                            type="url"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 outline-none mb-2"
                            placeholder="Tempel link map di sini..."
                            value={formData.googleMapsLink}
                            onChange={e => handleGmapsLinkChange(e.target.value)}
                        />
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
                        <p className="text-xs text-blue-600 mt-2">*Koordinat otomatis diambil dari link. Jika gagal, isi manual dari Google Maps.</p>
                    </div>

                    {/* Categories */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Kategori (Boleh lebih dari 1)</label>
                        <div className="flex flex-wrap gap-2">
                            {availableCategories.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => handleCategoryToggle(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all border shadow-sm ${formData.categories.includes(cat)
                                        ? 'bg-brand-orange text-white border-brand-orange ring-2 ring-orange-200 scale-105'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Restricted Tags */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Verdict (Tag Internal)</label>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => handleTagToggle(tag)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all border shadow-sm ${formData.tags.includes(tag)
                                        ? 'bg-brand-red text-white border-brand-red ring-2 ring-red-200 scale-105'
                                        : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
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
