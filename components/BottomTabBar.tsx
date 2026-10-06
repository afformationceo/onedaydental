"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Home, Smile, Newspaper, Receipt } from "lucide-react";
import { SiLine } from "react-icons/si";
import { lineUrl } from "@/lib/config";
import { trackConsultClick } from "@/lib/track";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/cn";

type Tab = {
  href: "/" | "/treatments" | "/blog" | "/prices";
  key: string;
  Icon: typeof Home;
};

// 단일 회수 경로(브리프 §5): 중앙 primary 탭 = 加 LINE.
// 폼으로 가던 '預約' 탭을 제거하고, 좌2(首頁·診療) / 중앙(LINE) / 우2(部落格·費用) 구성.
// '心得'(후기) 탭은 메뉴 자체가 불필요하다는 요청으로 제거 — 部落格로 대체.
const LEFT: Tab[] = [
  { href: "/", key: "home", Icon: Home },
  { href: "/treatments", key: "treatments", Icon: Smile },
];
const RIGHT: Tab[] = [
  { href: "/blog", key: "blog", Icon: Newspaper },
  { href: "/prices", key: "prices", Icon: Receipt },
];

export default function BottomTabBar() {
  const t = useTranslations("tabbar");
  const locale = useLocale() as Locale;
  const pathname = usePathname();

  const NavTab = ({
    href,
    labelKey,
    Icon,
  }: {
    href: Tab["href"];
    labelKey: string;
    Icon: typeof Home;
  }) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={cn(
          "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition",
          active ? "text-brand-600" : "text-ink-400 hover:text-ink-700",
        )}
      >
        <Icon className="size-[19px]" strokeWidth={active ? 2.5 : 2} />
        <span>{t(labelKey)}</span>
      </Link>
    );
  };

  return (
    <nav
      aria-label="Primary"
      className="sticky bottom-0 z-40 mt-auto border-t border-ink-100 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {LEFT.map((tab) => (
          <li key={tab.href}>
            <NavTab href={tab.href} labelKey={tab.key} Icon={tab.Icon} />
          </li>
        ))}

        {/* 중앙 primary — 加 LINE (TW 1순위 전환 채널). sticky 상시 노출. */}
        <li className="relative">
          <a
            href={lineUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackConsultClick({ channel: "line", locale, placement: "tabbar_center" })
            }
            aria-label={t("consult")}
            className="flex flex-col items-center gap-1 pb-1.5 pt-2"
          >
            <span className="-mt-5 grid size-12 place-items-center rounded-xl bg-[#06C755] text-white shadow-lg shadow-[#06C755]/30 ring-4 ring-white transition active:scale-95">
              <SiLine className="size-6" />
            </span>
            <span className="text-[10px] font-bold text-[#06A24A]">{t("consult")}</span>
          </a>
        </li>

        {RIGHT.map((tab) => (
          <li key={tab.href}>
            <NavTab href={tab.href} labelKey={tab.key} Icon={tab.Icon} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
