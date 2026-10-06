"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import { SiLine } from "react-icons/si";
import { getIcon } from "@/lib/icons";
import { primaryMessenger } from "@/lib/config";
import { trackConsultClick } from "@/lib/track";
import type { Locale } from "@/lib/types";
import { cn } from "@/lib/cn";
import Logo from "./Logo";
import MessengerButtons from "./MessengerButtons";

interface TreatmentCat {
  id: string;
  name: string;
  icon: string;
  items: { slug: string; name: string }[];
}

export default function Header({ treatmentCats }: { treatmentCats: TreatmentCat[] }) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const line = primaryMessenger(locale);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(true); // treatments accordion open by default
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Desktop inline nav (full-width header)
  const desktopLinks = [
    { href: "/", key: "home" },
    { href: "/treatments", key: "treatments" },
    { href: "/prices", key: "prices" },
    { href: "/blog", key: "blog" },
    { href: "/about", key: "about" },
  ] as const;

  const directLinks = [
    { href: "/", key: "home" },
    { href: "/about", key: "about" },
  ] as const;
  // 단일 회수 경로(브리프 §5): 드로어 CTA를 폼(/reservation)으로 분기시키지 않는다.
  // 라인 상담은 드로어 하단 MessengerButtons + 데스크탑 헤더 라인 버튼으로 통일.
  const tailLinks = [
    { href: "/prices", key: "prices" },
    { href: "/blog", key: "blog" },
  ] as const;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled || open
          ? "border-b border-ink-100/70 bg-surface/90 backdrop-blur-xl"
          : "bg-gradient-to-b from-surface/95 to-surface/0",
      )}
    >
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4 lg:h-16 lg:px-8">
        <Link href="/" aria-label="ONEDAY Dental home">
          <Logo className="scale-[0.92] origin-left" priority />
        </Link>

        {/* Desktop inline nav */}
        <nav className="hidden items-center gap-7 lg:flex">
          {desktopLinks.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[14.5px] font-semibold transition",
                  active ? "text-brand-700" : "text-ink-700 hover:text-brand-600",
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
          <a
            href={line.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackConsultClick({ channel: line.type, locale, placement: "header" })
            }
            className="inline-flex items-center gap-2 rounded-full bg-[#06C755] px-5 py-2.5 text-[14px] font-bold text-white shadow-md transition hover:shadow-lg active:scale-95"
          >
            <SiLine className="size-[18px]" />
            {t("reservation")}
          </a>
        </nav>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-1.5 lg:hidden">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={open}
            className="grid size-9 place-items-center rounded-xl text-ink-800 transition hover:bg-surface-soft"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Slide-down drawer with working sub-menus (mobile only) */}
      <div
        className={cn(
          "grid overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <nav className="min-h-0" inert={!open} aria-hidden={!open}>
          <div className="max-h-[78dvh] overflow-y-auto border-t border-ink-100 bg-surface px-3 py-3">
            <ul className="space-y-0.5">
              {directLinks.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-semibold transition",
                        active ? "bg-brand-50 text-brand-700" : "text-ink-800 hover:bg-surface-soft",
                      )}
                    >
                      {t(item.key)}
                      {active && <span className="size-1.5 rounded-full bg-brand-500" />}
                    </Link>
                  </li>
                );
              })}

              {/* Treatments accordion */}
              <li>
                <button
                  onClick={() => setExpanded((e) => !e)}
                  aria-expanded={expanded}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-3 text-[15px] font-semibold transition",
                    pathname.startsWith("/treatments")
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-800 hover:bg-surface-soft",
                  )}
                >
                  {t("treatments")}
                  <ChevronDown
                    className={cn("size-4 transition-transform", expanded && "rotate-180")}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300",
                    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="ml-2 mt-1 space-y-2 border-l border-ink-100 pl-3">
                      {treatmentCats.map((cat) => {
                        const Icon = getIcon(cat.icon);
                        return (
                          <div key={cat.id}>
                            <p className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-600">
                              <Icon className="size-3.5" strokeWidth={2.3} />
                              {cat.name}
                            </p>
                            <ul>
                              {cat.items.map((it) => (
                                <li key={it.slug}>
                                  <Link
                                    href={`/treatments/${it.slug}`}
                                    className="flex items-center justify-between rounded-lg px-2 py-2 text-[13.5px] font-medium text-ink-700 transition hover:bg-surface-soft hover:text-brand-700"
                                  >
                                    {it.name}
                                    <ChevronRight className="size-3.5 text-ink-300" />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                      <Link
                        href="/treatments"
                        className="mt-1 block rounded-lg px-2 py-2 text-[13px] font-bold text-brand-700 hover:underline"
                      >
                        {t("treatments")} →
                      </Link>
                    </div>
                  </div>
                </div>
              </li>

              {tailLinks.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-semibold transition",
                        active
                          ? "bg-brand-50 text-brand-700"
                          : "text-ink-800 hover:bg-surface-soft",
                      )}
                    >
                      {t(item.key)}
                      {active && <span className="size-1.5 rounded-full bg-brand-500" />}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="mt-3 px-1">
              <MessengerButtons placement="header_drawer" variant="row" />
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
