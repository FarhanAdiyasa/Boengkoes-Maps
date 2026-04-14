import React from 'react';
import { Restaurant } from '../types';

interface Props {
  data: Restaurant;
  onCheckIn: (id: string) => void;
  isCheckedIn: boolean;
}

const RestaurantCard: React.FC<Props> = ({ data, onCheckIn, isCheckedIn }) => {
  const getYouTubeVideoId = (url: string | undefined) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*\/v\/|.*\/embed\/))([^?&"'>]+)/);
    return match ? match[1] : null;
  };

  const imageCandidates = React.useMemo(() => {
    const candidates: string[] = [];
    const videoId = getYouTubeVideoId(data.youtubeLink);

    if (videoId) {
      // Use multiple endpoints/hosts to reduce chance of CDN timeout.
      candidates.push(`https://i.ytimg.com/vi_webp/${videoId}/hqdefault.webp`);
      candidates.push(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`);
      candidates.push(`https://i3.ytimg.com/vi/${videoId}/hqdefault.jpg`);
      candidates.push(`https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`);
    }

    // Keep user-provided non-YouTube thumbnail as additional fallback.
    if (data.thumbnail && !data.thumbnail.includes('youtube.com') && !data.thumbnail.includes('ytimg.com')) {
      candidates.push(data.thumbnail);
    }

    // Final local fallback (no network request required).
    const fallbackSvg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300" viewBox="0 0 600 300">
        <defs>
          <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#f3f4f6"/>
            <stop offset="100%" stop-color="#e5e7eb"/>
          </linearGradient>
        </defs>
        <rect width="600" height="300" fill="url(#g)"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6b7280" font-family="Arial, sans-serif" font-size="22">Thumbnail video tidak tersedia</text>
      </svg>`
    );
    candidates.push(`data:image/svg+xml;charset=UTF-8,${fallbackSvg}`);

    return candidates;
  }, [data.thumbnail, data.youtubeLink, data.id]);

  const [imgSrc, setImgSrc] = React.useState(imageCandidates[0]);
  const [candidateIndex, setCandidateIndex] = React.useState(0);

  React.useEffect(() => {
    setCandidateIndex(0);
    setImgSrc(imageCandidates[0]);
  }, [imageCandidates]);

  const handleImageError = () => {
    const nextIndex = candidateIndex + 1;
    if (nextIndex < imageCandidates.length) {
      setCandidateIndex(nextIndex);
      setImgSrc(imageCandidates[nextIndex]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-4 border border-gray-100 transform transition-all hover:scale-[1.02]">
      <div className="relative h-48 bg-gray-200">
        {/* Restaurant Image - Use YouTube thumbnail with fallback to lower quality */}
        <img
          src={imgSrc}
          alt={data.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 leading-tight mb-3">{data.name}</h3>

        {/* Action Buttons - Side by Side */}
        <div className="flex gap-3">
          {/* Tonton button - use youtubeLink */}
          {data.youtubeLink && (
            <a
              href={data.youtubeLink}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center py-2.5 px-4 bg-brand-red text-white rounded-lg font-medium text-sm hover:bg-red-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
              Tonton
            </a>
          )}
          <a
            href={data.googleMapsUri}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center py-2.5 px-4 border-2 border-brand-orange text-brand-orange rounded-lg font-medium text-sm hover:bg-orange-50 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Navigasi
          </a>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
