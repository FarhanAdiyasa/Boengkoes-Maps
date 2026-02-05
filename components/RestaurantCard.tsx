import React from 'react';
import { Restaurant } from '../types';

interface Props {
  data: Restaurant;
  onCheckIn: (id: string) => void;
  isCheckedIn: boolean;
}

const RestaurantCard: React.FC<Props> = ({ data, onCheckIn, isCheckedIn }) => {
  // Determine verdict color
  const getVerdictStyle = (verdict: string) => {
    if (verdict.includes("Ngaco")) return "bg-red-600 text-white";
    if (verdict.includes("Oke")) return "bg-brand-orange text-white";
    return "bg-gray-200 text-gray-800";
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4 border border-gray-100 transform transition-all hover:scale-[1.02]">
      <div className="relative h-48 bg-gray-200">
        {/* Restaurant Image - Use YouTube thumbnail or fallback */}
        <img
          src={data.thumbnail || `https://picsum.photos/seed/${data.id}/600/300`}
          alt={data.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center shadow-sm">
          <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-sm font-bold text-gray-800">{data.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-500 ml-1">({data.userRatingCount})</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 leading-tight">{data.name}</h3>
        </div>

        <p className="text-gray-500 text-sm mb-4 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {data.distance ? `${data.distance} away` : 'Nearby'}
        </p>

        {/* Boengkoes Review Section */}
        {data.boengkoesReview && (
          <div className="bg-orange-50 p-3 rounded-lg mb-4 border border-orange-100">
            <div className="flex items-center mb-1">
              <div className="w-6 h-6 rounded-full bg-brand-red mr-2 flex items-center justify-center text-white text-xs font-bold">B</div>
              <span className="text-xs font-semibold text-brand-red">Boengkoes Says:</span>
            </div>
            <p className="text-sm text-gray-700 italic">
              {data.boengkoesReview.summary.includes("Terimakasi Gaes")
                ? "\"Sorry, we haven't added the quote yet.\""
                : `"${data.boengkoesReview.summary}"`}
            </p>
            <a href={data.boengkoesReview.youtubeTimestamp} target="_blank" rel="noreferrer" className="text-xs text-brand-orange font-medium mt-2 flex items-center hover:underline">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
              Watch Review
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 mt-4">
          <a
            href={data.googleMapsUri}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center py-2 px-4 border border-brand-orange text-brand-orange rounded-lg font-medium text-sm hover:bg-orange-50 transition-colors"
          >
            Navigate
          </a>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
