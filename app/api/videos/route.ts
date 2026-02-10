import { NextResponse } from 'next/server';

const CHANNEL_ID = 'UCFCCYsnnuGFdDDJ4FkykOlg';
const UPLOADS_PLAYLIST_ID = 'UUFCCYsnnuGFdDDJ4FkykOlg'; // UC → UU
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
function isGotecRecordsVideo(title: string): boolean {
  return title.toUpperCase().includes('GOTEC RECORDS');
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
  duration?: string;
}

// Parse ISO 8601 duration to seconds
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return (parseInt(match[1] || '0') * 3600) + (parseInt(match[2] || '0') * 60) + parseInt(match[3] || '0');
}

// Simple in-memory cache
let cachedVideos: YouTubeVideo[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function fetchAllUploads(): Promise<YouTubeVideo[]> {
  if (!YOUTUBE_API_KEY) {
    console.error('[Videos] YOUTUBE_API_KEY not configured');
    return [];
  }

  const videos: YouTubeVideo[] = [];
  let pageToken: string | undefined;

  // Paginate through all uploads
  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('playlistId', UPLOADS_PLAYLIST_ID);
    url.searchParams.set('maxResults', '50');
    url.searchParams.set('key', YOUTUBE_API_KEY);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) {
      console.error('[Videos] YouTube API error:', res.status, await res.text());
      break;
    }

    const data = await res.json();

    for (const item of data.items || []) {
      const title: string = item.snippet?.title || '';
      if (isGotecRecordsVideo(title)) {
        videos.push({
          id: item.snippet.resourceId?.videoId,
          title,
          thumbnail: item.snippet.thumbnails?.maxres?.url
            || item.snippet.thumbnails?.high?.url
            || item.snippet.thumbnails?.medium?.url
            || '',
          publishedAt: item.snippet.publishedAt,
        });
      }
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  // Filter out Shorts by checking video duration (< 3 min = Short)
  if (videos.length > 0) {
    const chunks = [];
    for (let i = 0; i < videos.length; i += 50) {
      chunks.push(videos.slice(i, i + 50));
    }

    const longVideos: YouTubeVideo[] = [];
    for (const chunk of chunks) {
      const ids = chunk.map((v) => v.id).join(',');
      const dUrl = new URL('https://www.googleapis.com/youtube/v3/videos');
      dUrl.searchParams.set('part', 'contentDetails');
      dUrl.searchParams.set('id', ids);
      dUrl.searchParams.set('key', YOUTUBE_API_KEY!);

      const dRes = await fetch(dUrl.toString());
      if (!dRes.ok) break;
      const dData = await dRes.json();

      const durationMap = new Map<string, number>();
      for (const item of dData.items || []) {
        durationMap.set(item.id, parseDuration(item.contentDetails?.duration || ''));
      }

      for (const video of chunk) {
        const seconds = durationMap.get(video.id) || 0;
        if (seconds >= 180) { // 3 minutes minimum → no Shorts
          longVideos.push(video);
        }
      }
    }

    longVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return longVideos;
  }

  return videos;
}

export async function GET() {
  try {
    const now = Date.now();

    // Return cached if fresh
    if (cachedVideos && now - cacheTimestamp < CACHE_DURATION) {
      return NextResponse.json(cachedVideos, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
      });
    }

    const videos = await fetchAllUploads();
    cachedVideos = videos;
    cacheTimestamp = now;

    return NextResponse.json(videos, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
    });
  } catch (error) {
    console.error('[Videos] Failed to fetch videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
