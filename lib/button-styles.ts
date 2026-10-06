/**
 * 공용 버튼 토큰 — LINE CTA(LineCta)와 일반 내부링크 버튼(ButtonLink)이
 * 같은 변형(variant)을 공유해 사이트 전체 버튼 룩이 일치하도록 한다.
 * 기존에 Hero/DoctorAuthority/Treatments 등에서 각자 손으로 쓰던
 * "inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-bold..."
 * 류 중복 클래스를 여기 하나로 모았다.
 */
export const BUTTON_BASE =
  "group inline-flex items-center justify-center gap-2 rounded-lg text-sm font-bold transition active:scale-95";

export const BUTTON_SIZE = {
  md: "px-6 py-3.5",
  sm: "px-4 py-2.5 text-[13px]",
} as const;

export const BUTTON_VARIANT = {
  // 민트 — 다크 배경 위 1순위 버튼
  solid:
    "bg-mint-400 text-brand-950 shadow-[0_8px_30px_-8px] shadow-mint-400/60 hover:bg-mint-300",
  // 라인 브랜드 그린 — "加 LINE" 직관적 인지
  line: "bg-[#06C755] text-white shadow-md hover:shadow-lg",
  // 보조(투명) — 다크 배경 위 세컨더리
  outline:
    "border border-white/20 bg-white/5 text-white backdrop-blur-md hover:border-mint-400/50 hover:bg-white/10",
  // 밝은 배경 위 세컨더리(아웃라인)
  outlineLight:
    "border border-ink-200 bg-surface text-brand-700 hover:border-mint-400 hover:bg-surface-soft",
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANT;
export type ButtonSize = keyof typeof BUTTON_SIZE;
