'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface HeroBackgroundProps {
  backgroundType: string;
  imageUrl: string;
}

export function HeroBackground({ backgroundType, imageUrl }: HeroBackgroundProps) {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (backgroundType !== 'video') return;

    fetch('/api/videos')
      .then((res) => res.json())
      .then((videos) => {
        if (Array.isArray(videos) && videos.length > 0) {
          setVideoId(videos[0].id);
        }
      })
      .catch(() => {});
  }, [backgroundType]);

  // Image mode with custom URL
  if (backgroundType === 'image' && imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={imageUrl}
        alt="GOTEC Records Studio"
        className="absolute inset-0 w-full h-full object-cover"
      />
    );
  }

  // Video mode
  if (backgroundType === 'video' && videoId) {
    return (
      <>
        {/* Fallback image shown until video loads */}
        <Image
          src="/hero.jpg"
          alt="GOTEC Records Studio"
          fill
          className={`object-cover transition-opacity duration-1000 ${videoReady ? 'opacity-0' : 'opacity-100'}`}
          priority
        />
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0&disablekb=1&fs=0&iv_load_policy=3&start=6`}
            allow="autoplay; encrypted-media"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none border-0"
            style={{
              width: '177.78vh',
              height: '100vh',
              minWidth: '100%',
              minHeight: '56.25vw',
            }}
            onLoad={() => setVideoReady(true)}
            title="Background Video"
          />
        </div>
      </>
    );
  }

  // Fallback: static image (default or no video found)
  return (
    <Image
      src="/hero.jpg"
      alt="GOTEC Records Studio"
      fill
      className="object-cover"
      priority
    />
  );
}
