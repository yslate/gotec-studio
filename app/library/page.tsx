'use client';

import { useState, useEffect } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

const VIDEOS_PER_PAGE = 12;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function extractArtistName(title: string): string {
  // Pattern: "ARTIST | GOTEC RECORDS | ..." → extract artist
  const parts = title.split('|').map((s) => s.trim());
  return parts[0] || title;
}

export default function LibraryPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch('/api/videos');
        if (res.ok) {
          setVideos(await res.json());
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const paginatedVideos = videos.slice(
    page * VIDEOS_PER_PAGE,
    (page + 1) * VIDEOS_PER_PAGE
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="container mx-auto px-4 py-12 sm:py-20 flex-1">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-2">Library</h1>
          <p className="text-sm text-muted-foreground mb-10">
            All GOTEC Records sessions — recorded live at the studio.
          </p>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="mt-3 h-4 bg-muted w-3/4" />
                  <div className="mt-2 h-3 bg-muted w-1/3" />
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20 border border-dashed">
              <p className="text-sm text-muted-foreground">No videos available yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedVideos.map((video) => (
                  <a
                    key={video.id}
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Play overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {extractArtistName(video.title)}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(video.publishedAt)}
                      </p>
                    </div>
                  </a>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={page === 0}
                    onClick={() => { setPage((p) => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    &larr; Previous
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {page + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    disabled={page + 1 >= totalPages}
                    onClick={() => { setPage((p) => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  >
                    Next &rarr;
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
