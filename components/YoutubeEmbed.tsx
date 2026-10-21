"use client";

import { useEffect, useRef, useState } from "react";
import { Youtube, Play } from "lucide-react";

function extractVideoId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/** Lazy, lightweight YouTube video embed (loads iframe only when in view). */
export default function YoutubeEmbed({ url }: { url: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const videoId = extractVideoId(url);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!videoId) return null;

  return (
    <div
      ref={ref}
      className="relative h-[400px] w-[244px] shrink-0 overflow-hidden rounded-2xl bg-ink-50 shadow-md shadow-ink-900/10 ring-1 ring-ink-100"
    >
      {visible ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube review"
          loading="lazy"
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-brand-50 to-ink-50 text-ink-400">
          <span className="grid size-14 place-items-center rounded-2xl bg-white shadow-sm">
            <Youtube className="size-7 text-[#FF0000]" />
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold">
            <Play className="size-3.5 fill-current" /> Video
          </span>
        </div>
      )}
    </div>
  );
}
