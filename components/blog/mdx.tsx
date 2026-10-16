// ============================================================
// MDX 렌더 매핑 — 블로그 본문 조판 (Tailwind typography 미사용, 토큰 수동 조판)
// 표준 마크다운 요소 + 커스텀 임베드 컴포넌트.
// 커스텀: <Figure> <Callout> <Steps>/<Step> <Cta> <ChannelHub>
// MDX 본문은 이 매핑으로 RSC 렌더되므로 모두 서버 컴포넌트.
// ============================================================

import type { ComponentProps, ReactNode } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Lightbulb, Check, AlertCircle } from "lucide-react";
import MessengerButtons from "@/components/MessengerButtons";
import ChannelHub from "./ChannelHub";
import { cn } from "@/lib/cn";

/* ---------- 커스텀 임베드 (MDX 본문에서 직접 사용) ---------- */

/** 본문 이미지 — next/image 최적화 + 캡션. 온보딩 카드 이미지는 세로 비율 많음. */
export function Figure({
  src,
  alt,
  caption,
  ratio = "4/3",
  priority,
}: {
  src: string;
  alt: string;
  caption?: string;
  ratio?: "16/9" | "4/3" | "1/1" | "3/4";
  priority?: boolean;
}) {
  return (
    <figure className="my-7">
      <div
        className="relative w-full overflow-hidden rounded-xl border border-ink-100 bg-surface-muted"
        style={{ aspectRatio: ratio.replace("/", " / ") }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 720px"
          className="object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-[13px] text-ink-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

type CalloutTone = "info" | "tip" | "warn";
export function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: CalloutTone;
  title?: string;
  children: ReactNode;
}) {
  const map = {
    info: { Icon: AlertCircle, ring: "border-brand-200 bg-brand-50", ic: "text-brand-600" },
    tip: { Icon: Lightbulb, ring: "border-mint-400/40 bg-mint-400/8", ic: "text-mint-600" },
    warn: { Icon: AlertCircle, ring: "border-amber-300 bg-amber-50", ic: "text-amber-600" },
  }[tone];
  const Icon = map.Icon;
  return (
    <div className={cn("my-6 flex gap-3 rounded-xl border p-4", map.ring)}>
      <Icon className={cn("mt-0.5 size-5 shrink-0", map.ic)} />
      <div className="min-w-0 text-[15px] leading-relaxed text-ink-700">
        {title && <p className="mb-1 font-bold text-ink-900">{title}</p>}
        {children}
      </div>
    </div>
  );
}

export function Steps({ children }: { children: ReactNode }) {
  return <ol className="my-6 space-y-3 [counter-reset:step]">{children}</ol>;
}
export function Step({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <li className="relative flex gap-3 rounded-xl border border-ink-100 bg-surface-soft p-4 [counter-increment:step]">
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-brand-900 font-mono text-[12px] font-bold text-mint-400 before:content-[counter(step)]" />
      <div className="min-w-0">
        <p className="text-[14.5px] font-bold text-ink-900">{title}</p>
        {children && (
          <div className="mt-1 text-[15px] leading-relaxed text-ink-600">{children}</div>
        )}
      </div>
    </li>
  );
}

/** 글 중간/하단 LINE CTA — 단일 회수 경로(브리프 §5) 준수. */
export function Cta({
  text = "想了解費用或預約？加 LINE，繁中客服即時回覆。",
  treatment = "牙齒美學療程",
}: {
  text?: string;
  treatment?: string;
}) {
  return (
    <div className="tech-glow relative my-8 overflow-hidden rounded-2xl border border-brand-800 bg-brand-950 p-5 text-white sm:p-6">
      <div className="tech-grid absolute inset-0 opacity-40" />
      <div className="relative">
        <p className="font-display text-[15px] font-bold leading-snug">{text}</p>
        <div className="mt-4">
          <MessengerButtons treatment={treatment} placement="blog_inline" variant="row" />
        </div>
      </div>
    </div>
  );
}

export { ChannelHub };

/* ---------- 표준 마크다운 요소 → 토큰 조판 ---------- */

function H2(props: ComponentProps<"h2">) {
  return (
    <h2
      className="mt-10 scroll-mt-24 border-l-[3px] border-mint-400 pl-3 font-display text-[clamp(1.25rem,3.6vw,1.6rem)] font-bold leading-tight text-ink-900"
      {...props}
    />
  );
}
function H3(props: ComponentProps<"h3">) {
  return (
    <h3
      className="mt-7 font-display text-[clamp(1.05rem,2.8vw,1.25rem)] font-bold text-ink-900"
      {...props}
    />
  );
}
function P(props: ComponentProps<"p">) {
  return <p className="mt-4 text-[16px] leading-[1.85] text-ink-700" {...props} />;
}
function A({ href = "#", ...rest }: ComponentProps<"a">) {
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  const cls = "font-semibold text-brand-700 underline underline-offset-2 decoration-mint-400/60 transition hover:text-mint-600";
  if (isInternal) {
    return <Link href={href} className={cls} {...rest} />;
  }
  return <a href={href} target="_blank" rel="noopener noreferrer" className={cls} {...rest} />;
}
function UL(props: ComponentProps<"ul">) {
  return <ul className="mt-4 space-y-2" {...props} />;
}
function OL(props: ComponentProps<"ol">) {
  return <ol className="mt-4 list-decimal space-y-2 pl-5 marker:font-bold marker:text-brand-600" {...props} />;
}
function LI({ children, ...rest }: ComponentProps<"li">) {
  return (
    <li
      className="flex gap-2 text-[16px] leading-relaxed text-ink-700 [ol_&]:list-item [ol_&]:pl-1"
      {...rest}
    >
      <Check className="mt-1 size-4 shrink-0 text-mint-500 [ol_&]:hidden" strokeWidth={3} />
      <span className="min-w-0">{children}</span>
    </li>
  );
}
function Blockquote(props: ComponentProps<"blockquote">) {
  return (
    <blockquote
      className="my-6 rounded-r-xl border-l-4 border-brand-300 bg-surface-soft py-3 pl-5 pr-4 text-[16px] font-medium italic leading-relaxed text-ink-700"
      {...props}
    />
  );
}
function Strong(props: ComponentProps<"strong">) {
  return <strong className="font-bold text-ink-900" {...props} />;
}
function HR() {
  return <hr className="my-9 border-t border-ink-100" />;
}
function Table(props: ComponentProps<"table">) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-ink-100">
      <table className="w-full border-collapse text-[14px]" {...props} />
    </div>
  );
}
function TH(props: ComponentProps<"th">) {
  return (
    <th
      className="border-b border-ink-100 bg-surface-muted px-3 py-2.5 text-left font-bold text-ink-800"
      {...props}
    />
  );
}
function TD(props: ComponentProps<"td">) {
  return <td className="border-b border-ink-100 px-3 py-2.5 align-top text-ink-600" {...props} />;
}
function IMG({ src, alt }: ComponentProps<"img">) {
  // 마크다운 ![](...) 도 깨지지 않게 — 단, 본문 이미지는 <Figure> 권장.
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={typeof src === "string" ? src : ""}
      alt={alt ?? ""}
      loading="lazy"
      className="my-6 w-full rounded-xl border border-ink-100"
    />
  );
}

export const mdxComponents = {
  h2: H2,
  h3: H3,
  p: P,
  a: A,
  ul: UL,
  ol: OL,
  li: LI,
  blockquote: Blockquote,
  strong: Strong,
  hr: HR,
  table: Table,
  th: TH,
  td: TD,
  img: IMG,
  // 커스텀
  Figure,
  Callout,
  Steps,
  Step,
  Cta,
  ChannelHub,
};
