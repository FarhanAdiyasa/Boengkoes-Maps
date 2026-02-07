const YOUTUBE_API_KEY = 'AIzaSyC_yA250Wghwo9q-6l7uZmcvQr0MedKuLw';

export const youtubeService = {
    extractVideoId(url: string): string | null {
        // Short link: https://youtu.be/VIDEO_ID
        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (shortMatch) return shortMatch[1];
        
        // Long link: https://www.youtube.com/watch?v=VIDEO_ID
        const longMatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
        if (longMatch) return longMatch[1];
        
        // Shorts link: https://youtube.com/shorts/VIDEO_ID
        const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
        if (shortsMatch) return shortsMatch[1];
        
        return null;
    },
    
    async fetchVideoInfo(videoId: string) {
        try {
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
            );
            const data = await response.json();
            
            if (data.items && data.items.length > 0) {
                const snippet = data.items[0].snippet;
                return {
                    title: snippet.title,
                    description: snippet.description,
                    thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
                    publishedAt: snippet.publishedAt,
                    channelTitle: snippet.channelTitle
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching YouTube video:', error);
            return null;
        }
    }
};
