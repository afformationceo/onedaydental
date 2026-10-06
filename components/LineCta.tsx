"use client";

import { useLocale } from "next-intl";
import { SiLine } from "react-icons/si";
import { ArrowRight } from "lucide-react";
import { lineUrl } from "@/lib/config";
import { trackConsultClick } from "@/lib/track";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/cn";
import { BUTTON_BASE, BUTTON_SIZE, BUTTON_VARIANT } from "@/lib/button-styles";

/**
 * 단일 회수 경로(LINE)용 재사용 CTA. (브리프 §5 — 헤더·본문·sticky 모두 LINE으로 통일)
 * 서버 섹션(Hero, FinalCta 등)에서 import 해서 사용한다.
 * 클릭 시 consult_click + line_click(GA4) + Meta Contact + 구글시트 적재가 모두 발화한다.
 */
export default function LineCta({
  placement,
  label,
  treatment,
  variant = "solid",
  showArrow = true,
  className,
}: {
  placement: string;
  label: string;
  treatment?: string;
  variant?: "solid" | "line" | "outline";
  showArrow?: boolean;
  className?: string;
}) {
  const locale = useLocale() as Locale;

  return (
    <a
      href={lineUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackConsultClick({ channel: "line", treatment, locale, placement })}
      className={cn(BUTTON_BASE, BUTTON_SIZE.md, BUTTON_VARIANT[variant], className)}
    >
      <SiLine className="size-[18px]" />
      {label}
      {showArrow && (
        <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
      )}
    </a>
  );
}
