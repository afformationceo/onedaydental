"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

function posterFor(src: string): string {
  return src
    .replace("/videos/influencer/", "/videos/influencer/posters/")
    .replace(/\.mp4$/, ".jpg");
}

/**
 * 자체 호스팅 mp4(public/videos/...) — 뷰포트에 들어오면 음소거 자동재생(루프),
 * 벗어나면 정지. 들어오기 전엔 실제 썸네일(ffmpeg로 뽑은 poster jpg)만 보여주고
 * 비디오 파일 자체는 전혀 요청하지 않는다. 우측하단 버튼으로 음소거 on/off.
 */
export default function SelfHostedVideoEmbed({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);
  const poster = posterFor(src);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView) {
      v.play().catch(() => {
        // 브라우저가 autoplay를 막은 경우 — 썸네일/수동 재생으로 자연스럽게 대체됨
      });
    } else {
      v.pause();
    }
  }, [inView]);

  return (
    <div
      ref={ref}
      className="relative h-[400px] w-[244px] shrink-0 overflow-hidden rounded-2xl bg-ink-50 shadow-md shadow-ink-900/10 ring-1 ring-ink-100"
    >
      {inView ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" loading="lazy" className="h-full w-full object-cover" />
      )}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute bottom-3 right-3 grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
    </div>
  );
}
