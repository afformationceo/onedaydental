"use client";

import { useState, useRef } from "react";
import {
  Smartphone,
  Monitor,
  RotateCw,
  ExternalLink,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * PC에서 모바일 화면을 검수하는 디바이스 미러 모드. (사용자 요청 — 모바일 99% 트래픽 검수)
 * 데스크탑 iframe + 모바일 폰 프레임 iframe을 같은 경로로 동시 로드한다.
 * 둘 다 same-origin 실제 사이트라 클릭·스크롤이 양쪽 모두 그대로 동작한다.
 * zh-TW(실제 대만 사용자 화면) ↔ ko(검수용) 언어 토글.
 */

const ROUTES = [
  { path: "/", label: "首頁 / 홈" },
  { path: "/prices", label: "費用 / 비용" },
  { path: "/treatments", label: "診療 / 진료" },
  { path: "/#reviews", label: "心得 / 후기" },
  { path: "/about", label: "介紹 / 소개" },
  { path: "/reservation", label: "預約 / 예약" },
] as const;

const DEVICES = [
  { id: "iphone", label: "iPhone", w: 390, h: 844 },
  { id: "android", label: "Android", w: 412, h: 915 },
  { id: "mini", label: "Mini", w: 360, h: 780 },
] as const;

export default function PreviewClient() {
  const [path, setPath] = useState<string>("/");
  const [lang, setLang] = useState<"zh-TW" | "ko">("zh-TW");
  const [device, setDevice] = useState<(typeof DEVICES)[number]>(DEVICES[0]);
  const [nonce, setNonce] = useState(0); // 새로고침 트리거
  const mobileRef = useRef<HTMLIFrameElement>(null);
  const deskRef = useRef<HTMLIFrameElement>(null);

  // zh-TW는 prefix 없음(/), ko는 /ko prefix.
  const buildSrc = (p: string) => (lang === "ko" ? `/ko${p === "/" ? "" : p}` : p);
  const src = `${buildSrc(path)}${path.includes("?") ? "&" : "?"}preview=1#${nonce}`;

  const refresh = () => setNonce((n) => n + 1);

  return (
    <div className="flex min-h-dvh flex-col bg-ink-950 text-white">
      {/* 컨트롤 바 */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-ink-900/95 backdrop-blur">
        <div className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3">
          <div className="flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-widest text-mint-400">
            <Smartphone className="size-4" />
            검수 미러
          </div>

          {/* 경로 선택 */}
          <div className="flex flex-wrap items-center gap-1.5">
            {ROUTES.map((r) => (
              <button
                key={r.path}
                onClick={() => setPath(r.path)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-[12px] font-semibold transition",
                  path === r.path
                    ? "bg-mint-400 text-ink-950"
                    : "bg-white/5 text-ink-200 hover:bg-white/10",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* 언어 토글 */}
            <div className="flex overflow-hidden rounded-md border border-white/15">
              {(["zh-TW", "ko"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={cn(
                    "px-2.5 py-1.5 text-[12px] font-bold transition",
                    lang === l ? "bg-white/15 text-white" : "text-ink-300 hover:bg-white/5",
                  )}
                >
                  {l === "zh-TW" ? "繁中(실사용)" : "검수ko"}
                </button>
              ))}
            </div>

            {/* 디바이스 크기 */}
            <div className="flex overflow-hidden rounded-md border border-white/15">
              {DEVICES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDevice(d)}
                  className={cn(
                    "px-2.5 py-1.5 text-[12px] font-bold transition",
                    device.id === d.id
                      ? "bg-white/15 text-white"
                      : "text-ink-300 hover:bg-white/5",
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <button
              onClick={refresh}
              title="새로고침"
              className="grid size-8 place-items-center rounded-md border border-white/15 text-ink-200 transition hover:bg-white/10"
            >
              <RotateCw className="size-4" />
            </button>
            <a
              href={buildSrc(path)}
              target="_blank"
              rel="noopener noreferrer"
              title="새 탭에서 열기"
              className="grid size-8 place-items-center rounded-md border border-white/15 text-ink-200 transition hover:bg-white/10"
            >
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </header>

      {/* 미러 영역 — 데스크탑 + 모바일 양쪽 동시 상호작용 */}
      <div className="flex flex-1 flex-col gap-6 overflow-auto p-5 xl:flex-row xl:items-start">
        {/* 데스크탑 뷰 */}
        <section className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-ink-300">
            <Monitor className="size-4" /> 데스크탑 · {lang === "ko" ? "/ko" : "繁中"}
            {path}
          </div>
          <div className="overflow-hidden rounded-xl border border-white/10 bg-white shadow-2xl">
            <iframe
              ref={deskRef}
              key={`desk-${src}`}
              src={src}
              title="desktop preview"
              className="h-[78dvh] w-full"
            />
          </div>
        </section>

        {/* 모바일 폰 프레임 */}
        <section className="shrink-0 self-center xl:self-start">
          <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-ink-300">
            <Smartphone className="size-4" /> 모바일 · {device.w}×{device.h}
          </div>
          {/* 폰 목업 */}
          <div
            className="relative rounded-[2.2rem] border-[10px] border-ink-800 bg-ink-800 shadow-2xl shadow-black/50"
            style={{ width: device.w + 20 }}
          >
            {/* 노치 */}
            <div className="absolute left-1/2 top-2 z-10 h-5 w-28 -translate-x-1/2 rounded-full bg-ink-900" />
            <div className="overflow-hidden rounded-[1.6rem] bg-white">
              <iframe
                ref={mobileRef}
                key={`mob-${src}`}
                src={src}
                title="mobile preview"
                style={{ width: device.w, height: device.h }}
                className="block"
              />
            </div>
          </div>
        </section>
      </div>

      {/* 안내 푸터 */}
      <footer className="border-t border-white/10 bg-ink-900 px-4 py-2.5 text-[11px] text-ink-400">
        <span className="inline-flex items-center gap-1.5">
          <Link2 className="size-3.5" />
          양쪽 화면 모두 실제 사이트입니다 — 클릭·스크롤·LINE 버튼이 그대로 동작합니다. (내부
          검수 전용 · 색인 안 됨)
        </span>
      </footer>
    </div>
  );
}
