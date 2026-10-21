"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/** 자체 호스팅 mp4(public/videos/...) 클릭 재생 — 클릭 전엔 비디오를 전혀 로드하지 않는다. */
export default function SelfHostedVideoEmbed({ src }: { src: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative h-[400px] w-[244px] shrink-0 overflow-hidden rounded-2xl bg-ink-50 shadow-md shadow-ink-900/10 ring-1 ring-ink-100">
      {playing ? (
        <video
          src={src}
          controls
          autoPlay
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label="Play video"
          className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-brand-50 to-ink-50 text-ink-400"
        >
          <span className="grid size-14 place-items-center rounded-2xl bg-white shadow-sm">
            <Play className="size-7 fill-current text-brand-600" />
          </span>
          <span className="text-xs font-semibold">Play</span>
        </button>
      )}
    </div>
  );
}
