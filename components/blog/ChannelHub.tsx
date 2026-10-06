// ============================================================
// ChannelHub — 백링크 상호강화 위젯 (글 하단 + 단독 임베드 가능)
// 라인·구글맵 1~3관을 한 그리드에 노출(사이트/Littly는 자기참조·미사용이라 제거,
// Instagram은 헤더 아래 FloatingInstagram 플로팅 버튼으로 분리).
// 모든 글이 전 채널로 나가는 링크를 가지면 → 채널끼리 도메인 신뢰 상호강화.
// 서버 컴포넌트 (인터랙션 없음). rel=noopener 로 안전한 외부링크.
// ============================================================

import { SiLine, SiInstagram } from "react-icons/si";
import { Globe, MapPin, Link2 } from "lucide-react";
import { CHANNELS, type Channel } from "@/lib/channels";
import { cn } from "@/lib/cn";

function ChannelIcon({ icon }: { icon: Channel["icon"] }) {
  const cls = "size-5 shrink-0";
  switch (icon) {
    case "line":
      return <SiLine className={cls} />;
    case "instagram":
      return <SiInstagram className={cls} />;
    case "globe":
      return <Globe className={cls} strokeWidth={2.2} />;
    case "map":
      return <MapPin className={cls} strokeWidth={2.2} />;
    case "link":
      return <Link2 className={cls} strokeWidth={2.2} />;
  }
}

export default function ChannelHub({
  title = "與 ONEDAY 連結",
  subtitle = "所有官方管道一次擁有 — 預約・諮詢・地圖導航",
  className,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "tech-glow relative overflow-hidden rounded-2xl border border-brand-800 bg-brand-950 p-5 text-white sm:p-7",
        className,
      )}
      aria-label={title}
    >
      <div className="tech-grid absolute inset-0 opacity-30" />
      <div className="relative">
        <span className="kicker text-mint-400 before:bg-mint-400/60">CHANNELS</span>
        <h2 className="mt-2 font-display text-[clamp(1.2rem,3.5vw,1.6rem)] font-bold leading-tight text-white">
          {title}
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink-200">{subtitle}</p>

        <ul className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {CHANNELS.map((c) => (
            <li key={c.id}>
              <a
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-mint-400/40 hover:bg-white/[0.08] active:scale-[0.99]"
              >
                <span
                  className="grid size-10 shrink-0 place-items-center rounded-lg transition group-hover:scale-105"
                  style={{ backgroundColor: `${c.color}22`, color: c.color }}
                >
                  <ChannelIcon icon={c.icon} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-bold text-white">
                    {c.label}
                  </span>
                  {c.sublabel && (
                    <span className="block truncate text-[11.5px] text-ink-300">
                      {c.sublabel}
                    </span>
                  )}
                </span>
                <span
                  aria-hidden
                  className="text-ink-400 transition group-hover:translate-x-0.5 group-hover:text-mint-400"
                >
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
