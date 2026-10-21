import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeader({
  kicker,
  title,
  subtitle,
  center,
  as: Heading = "h2",
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  /** 이 헤더가 페이지의 유일한 최상위 제목(h1)일 때만 "h1"로 지정 — 그 외엔 기본값(h2) 유지. */
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("px-5", center && "text-center")}>
      {kicker && (
        <span className={cn("kicker", center && "justify-center")}>{kicker}</span>
      )}
      <Heading className="mt-3 font-display text-[clamp(1.55rem,4.5vw,2.4rem)] font-bold leading-[1.12] tracking-tight text-ink-900">
        {title}
      </Heading>
      {subtitle && (
        <p
          className={cn(
            "mt-3 max-w-2xl text-[14.5px] leading-relaxed text-ink-500 lg:text-[15.5px]",
            center && "mx-auto",
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Section({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-10", className)}>
      {children}
    </section>
  );
}
