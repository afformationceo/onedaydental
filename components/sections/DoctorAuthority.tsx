import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getClinic } from "@/lib/clinic";
import { tx } from "@/lib/i18n-text";
import type { Locale } from "@/lib/types";
import { BadgeCheck, ArrowRight } from "lucide-react";
import { SectionHeader } from "./Section";
import DoctorIntroVideo from "./DoctorIntroVideo";

/**
 * Authority spotlight for the lead doctor (Kim Jinhwan) — real career bullets,
 * real photo. Builds trust before treatments per TW dental-benchmark order.
 */
export default async function DoctorAuthority() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("authority");
  const clinic = getClinic();
  const lead = clinic.doctors[0];
  if (!lead) return null;

  const name = tx(lead.name, locale);
  const careers = lead.career.slice(0, 5);

  return (
    <section className="bg-surface-soft py-14 lg:py-20">
      <div className="mx-auto max-w-screen-2xl lg:px-6">
        <SectionHeader kicker={t("kicker")} title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-8 px-5 lg:px-0">
          <div className="mx-auto max-w-5xl">
            {/* 대표원장 소개영상 — 크게, 전면에 */}
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-brand-950 shadow-xl shadow-ink-900/15 ring-1 ring-ink-100">
              <DoctorIntroVideo />
            </div>

            {/* Bio */}
            <div className="mt-8 text-center">
              <h3 className="font-display text-[26px] font-bold leading-tight text-ink-900">
                {name}
              </h3>
              <p className="mt-1 text-[14px] font-bold text-mint-600">{tx(lead.title, locale)}</p>
              <p className="mx-auto mt-3 max-w-xl text-[13px] leading-relaxed text-ink-500">
                {tx(lead.specialty, locale)}
              </p>

              <ul className="mx-auto mt-6 grid max-w-2xl gap-2.5 border-t border-ink-100 pt-6 text-left sm:grid-cols-2">
                {careers.map((c, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-[12.5px] leading-relaxed text-ink-700"
                  >
                    <BadgeCheck
                      className="mt-0.5 size-4 shrink-0 text-mint-500"
                      strokeWidth={2.2}
                    />
                    <span>{tx(c, locale)}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/about"
                className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-700 transition hover:text-mint-600"
              >
                {t("more")}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
