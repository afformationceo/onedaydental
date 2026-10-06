"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

/** Persist UTM params from the URL into sessionStorage so they survive navigation. */
export function captureUtm() {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  let found = false;
  const store: Record<string, string> = {};
  for (const k of UTM_KEYS) {
    const v = params.get(k);
    if (v) {
      store[k] = v;
      found = true;
    }
  }
  if (found) {
    sessionStorage.setItem("he_utm", JSON.stringify(store));
  }
}

export function getUtm(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(sessionStorage.getItem("he_utm") || "{}");
  } catch {
    return {};
  }
}

/** Generic GA4 event helper — UTM 자동 부착. 노출/스크롤 등 비클릭 이벤트에 사용. */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, { ...params, ...getUtm() });
}

/**
 * 같은 클릭이 두 번 집계되는 걸 막는 가드 — 짧은 시간창(600ms) 안에 같은
 * channel+placement+treatment 조합이 다시 들어오면 무시한다(더블클릭, 중복
 * onClick 바인딩 등 방어). 모듈 스코프 변수라 탭 단위로 유지된다.
 */
let lastFire: { key: string; at: number } | null = null;
const DEDUP_WINDOW_MS = 600;

function shouldDedup(key: string): boolean {
  const now = Date.now();
  if (lastFire && lastFire.key === key && now - lastFire.at < DEDUP_WINDOW_MS) {
    return true;
  }
  lastFire = { key, at: now };
  return false;
}

/** Fire a consultation-click event to GA4 + Meta Pixel, tagged with channel/treatment/UTM. */
export function trackConsultClick(opts: {
  channel: string;
  treatment?: string;
  locale: string;
  placement: string;
}) {
  if (typeof window === "undefined") return;
  const dedupKey = `${opts.channel}|${opts.placement}|${opts.treatment ?? ""}`;
  if (shouldDedup(dedupKey)) return;

  const utm = getUtm();
  // transport_type:'beacon' — 이 직후 바로 LINE/IG 등으로 페이지 이동이 일어나도
  // 요청이 중간에 끊기지 않고 navigator.sendBeacon 으로 확실히 전송되게 한다.
  const payload = { ...opts, ...utm, transport_type: "beacon" };
  window.gtag?.("event", "consult_click", payload);
  // 브리프 §7 — 모든 라인 버튼은 line_click 으로도 발화(라인 도달률 자동 집계).
  if (opts.channel === "line") window.gtag?.("event", "line_click", payload);
  window.fbq?.("track", "Contact", payload);
  // 자체 인입 적재 (구글 시트). keepalive로 LINE 이동 후에도 전송 보장. 실패는 무시.
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* noop */
  }
}
