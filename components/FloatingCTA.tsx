"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { primaryMessenger, buildMessengerHref } from "@/lib/config";
import type { Locale } from "@/lib/types";
import { trackConsultClick } from "@/lib/track";
import { SiLine } from "react-icons/si";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * 단일 회수 경로(브리프 §5) — 여기엔 LINE 하나만 띄운다.
 * Instagram은 더 이상 이 스택에 같이 쌓지 않고 FloatingInstagram(우측상단)으로 분리했다.
 */
export default function FloatingCTA() {
  const locale = useLocale() as Locale;
  const line = primaryMessenger(locale);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-20 right-3 z-40 flex flex-col items-end gap-2.5 lg:bottom-6 lg:right-6">
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
          className="pointer-events-auto grid size-10 place-items-center rounded-full border border-ink-100 bg-white/90 text-ink-700 shadow-lg backdrop-blur transition hover:text-brand-600 active:scale-95"
        >
          <ChevronUp className="size-5" />
        </button>
      )}
      <a
        href={buildMessengerHref(line, locale, "")}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackConsultClick({ channel: line.type, locale, placement: "floating" })}
        aria-label={line.label}
        className={cn(
          "pointer-events-auto grid size-12 place-items-center rounded-full text-white shadow-xl transition active:scale-90",
          "animate-[pulse_2.5s_ease-in-out_infinite]",
        )}
        style={{ backgroundColor: line.color, color: "#fff" }}
      >
        <SiLine className="size-6" />
      </a>
    </div>
  );
}
