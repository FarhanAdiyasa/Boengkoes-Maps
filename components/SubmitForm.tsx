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

    // Attempt to parse coordinates from Google Maps Link
    const handleGmapsLinkChange = (link: string) => {
        setFormData(prev => ({ ...prev, googleMapsLink: link }));

        // Try to extract @lat,lng
        const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const match = link.match(regex);
        if (match) {
            setFormData(prev => ({
                ...prev,
                latitude: match[1],
                longitude: match[2],
                googleMapsLink: link
            }));
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const success = await spotService.create({
            name: formData.name,
            googleMapsUri: formData.googleMapsLink,
            latitude: parseFloat(formData.latitude) || 0,
            longitude: parseFloat(formData.longitude) || 0,
            categories: formData.categories,
            tags: formData.tags,
            youtubeLink: formData.youtubeLink,
            verdict: "Internal Submission", // or derive from tags if needed, though schema has specific verdict column
        });

        if (success) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1000);
        } else {
            alert("Failed to save. Check console.");
        }

        setIsSubmitting(false);
    };

    if (success) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">💾</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Saved!</h2>
                <p className="text-gray-500">New spot added to Boengkoes Database.</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-gray-50 overflow-y-auto animate-slide-up flex flex-col">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10 shadow-sm">
                <h2 className="font-bold text-lg text-gray-800 flex items-center">
                    <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded mr-2 uppercase tracking-wide">Internal</span>
                    Add New Spot
                </h2>
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            <div className="p-6 max-w-lg mx-auto w-full flex-1">
                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* YouTube Link - Priority */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">YouTube Link / Timestamp</label>
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
                            placeholder="e.g. Nasi Goreng Gila"
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
                            placeholder="Paste full map link here..."
                            value={formData.googleMapsLink}
                            onChange={e => handleGmapsLinkChange(e.target.value)}
                        />
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Lat"
                                className="w-1/2 px-3 py-1 text-sm bg-white border border-gray-200 rounded text-gray-500"
                                value={formData.latitude}
                                readOnly
                            />
                            <input
                                type="text"
                                placeholder="Lng"
                                className="w-1/2 px-3 py-1 text-sm bg-white border border-gray-200 rounded text-gray-500"
                                value={formData.longitude}
                                readOnly
                            />
                        </div>
                        <p className="text-xs text-blue-600 mt-1">*Paste link, we'll try to grab coords automatically.</p>
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
                        <label className="block text-sm font-bold text-gray-700 mb-2">Verdict (Internal Tags)</label>
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
                            {isSubmitting ? 'Saving...' : 'Save to Database 💾'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubmitForm;
