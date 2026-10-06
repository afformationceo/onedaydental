"use client";

import { SiInstagram } from "react-icons/si";
import { INSTAGRAM_URL } from "@/lib/channels";
import { useLocale } from "next-intl";
import type { Locale } from "@/lib/types";
import { trackConsultClick } from "@/lib/track";

/**
 * 헤더 아래 우측상단 고정 Instagram 버튼. LINE(하단 플로팅, 단일 회수 경로)과
 * 경쟁하지 않도록 자리를 분리했다 — Instagram은 보조 채널이라 눈에 띄되 가볍게.
 */
export default function FloatingInstagram() {
  const locale = useLocale() as Locale;
  return (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackConsultClick({ channel: "instagram", locale, placement: "floating_top" })}
      aria-label="Instagram"
      className="fixed right-3 top-[68px] z-30 grid size-10 place-items-center rounded-full text-white shadow-lg transition active:scale-90 lg:right-6 lg:top-20"
      style={{ backgroundColor: "#E1306C" }}
    >
      <SiInstagram className="size-[18px]" />
    </a>
  );
}
