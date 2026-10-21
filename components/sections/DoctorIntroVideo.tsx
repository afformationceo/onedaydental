"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const SRC = "/videos/doctor-intro.mp4";
const POSTER = "/videos/posters/doctor-intro.jpg";

/**
 * 대표원장 소개영상 — 뷰포트에 들어오면 음소거 자동재생(루프),
 * 벗어나면 정지. 들어오기 전엔 실제 썸네일(ffmpeg 추출 poster)만 보여준다.
 */
export default function DoctorIntroVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (inView) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [inView]);

  return (
    <div ref={ref} className="absolute inset-0">
      {inView ? (
        <video
          ref={videoRef}
          src={SRC}
          poster={POSTER}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover object-top"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={POSTER}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover object-top opacity-90"
        />
      )}
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur"
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>
    </div>
  );
}
