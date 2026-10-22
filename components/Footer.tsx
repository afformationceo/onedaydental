import { getLocale, getTranslations } from "next-intl/server";
import { getClinic } from "@/lib/clinic";
import { tx } from "@/lib/i18n-text";
import type { Locale } from "@/lib/types";
import { MapPin, Clock, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Logo from "./Logo";

export default async function Footer() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");
  const clinic = getClinic();

  return (
    <footer className="relative overflow-hidden border-t-2 border-mint-400/30 bg-brand-950 px-5 pb-24 pt-12 text-ink-200 lg:pb-12">
      <div className="tech-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="relative mx-auto max-w-screen-2xl lg:px-6">
        <div className="lg:flex lg:items-start lg:justify-between lg:gap-12">
          <div className="lg:max-w-sm">
            <Logo variant="light" />
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-mint-400">
              CLEAN MEDICAL TECH · SEOUL
            </p>
          </div>

          <div className="mt-7 space-y-3 text-sm lg:mt-0 lg:flex-1">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-mint-400" />
              <ul className="space-y-1.5">
                {clinic.branches.map((b, i) => (
                  <li key={b.id} className="leading-snug">
                    <span className="mr-1.5 font-semibold text-mint-300">
                      {locale === "ko" ? `${i + 1}관` : `${i + 1}館`}
                    </span>
                    {tx(b.address, locale)}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-mint-400" />
              <ul className="space-y-0.5">
                {clinic.hours.map((h, i) => (
                  <li key={i}>{tx(h, locale)}</li>
                ))}
              </ul>
            </div>
            <p className="flex items-center gap-2.5">
              <Phone className="size-4 shrink-0 text-mint-400" />
              <a href={`tel:${clinic.phone}`} className="hover:text-white">
                {clinic.phone}
              </a>
            </p>
          </div>
        </div>

        <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {(["treatments", "prices", "blog", "reservation"] as const).map((key) => (
            <Link key={key} href={`/${key}`} className="hover:text-white">
              {tn(key)}
            </Link>
          ))}
        </nav>

        <p className="mt-5 border-t border-white/10 pt-5 text-[11px] leading-relaxed text-ink-400">
          {t("disclaimer")}
        </p>
        <p className="mt-3 text-[11px] text-ink-500">{t("rights")}</p>
      </div>
    </footer>
  );
}
