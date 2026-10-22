"use client";

import { useEffect, useRef, useState } from "react";

const SRC = "/videos/doctor-intro.mp4";
const POSTER = "/videos/posters/doctor-intro.jpg";

/**
 * 대표원장 소개영상 — 뷰포트에 들어오면 음소거 자동재생(루프) 시작,
 * 이후엔 네이티브 컨트롤(재생/정지・탐색바・볼륨)로 사용자가 직접 조작.
 * 들어오기 전엔 실제 썸네일(ffmpeg 추출 poster)만 보여준다.
 */
export default function DoctorIntroVideo() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0">
      {inView ? (
        <video
          src={SRC}
          poster={POSTER}
          controls
          autoPlay
          muted
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
    </div>
  );
}
