import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getClinic } from "@/lib/clinic";
import { tx } from "@/lib/i18n-text";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { BadgeCheck } from "lucide-react";
import { getIcon } from "@/lib/icons";
import DoctorCard from "@/components/DoctorCard";
import FinalCta from "@/components/sections/FinalCta";
import FacilityGallery from "@/components/sections/FacilityGallery";
import LocationMap from "@/components/LocationMap";
import { SectionHeader } from "@/components/sections/Section";
import Reveal from "@/components/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return buildMetadata({ locale: locale as Locale, path: "/about", title: t("about") });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as Locale;
  const t = await getTranslations();
  const clinic = getClinic();

  return (
    <div className="mx-auto max-w-screen-2xl pb-12 lg:px-6">
      {/* Intro + facility image (compact, side-by-side on PC) */}
      <section className="grid gap-7 px-5 pt-10 lg:grid-cols-2 lg:items-center lg:gap-10 lg:px-0">
        <div>
          <span className="kicker">ABOUT ONEDAY</span>
          <h1 className="mt-3 font-display text-[clamp(1.7rem,5vw,2.6rem)] font-bold leading-[1.12] tracking-tight text-ink-900">
            {tx(clinic.tagline, locale)}
          </h1>
          <p className="mt-4 text-[14.5px] leading-relaxed text-ink-600 lg:text-[15.5px]">
            {tx(clinic.intro, locale)}
          </p>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-ink-100">
          <Image
            src="/facility/hall1/hall1-01.jpg"
            alt={tx(clinic.name, locale)}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-950/85 to-transparent p-4">
            <p className="text-[13px] font-bold text-white">{tx(clinic.address, locale)}</p>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="mt-12 px-5 lg:px-0">
        <h2 className="font-display text-[18px] font-bold text-ink-900">
          {t("trust.registered")}
        </h2>
        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {clinic.certifications.map((c, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <li className="flex items-center gap-3 rounded-lg border border-ink-100 bg-surface p-3.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-900 text-mint-400">
                  <BadgeCheck className="size-5" strokeWidth={2.3} />
                </span>
                <span className="text-[13px] font-semibold text-ink-800">
                  {tx(c, locale)}
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* USP */}
      <section className="mt-12">
        <SectionHeader kicker={t("usp.kicker")} title={t("usp.title")} />
        <div className="mt-6 grid grid-cols-2 gap-3 px-5 lg:grid-cols-4 lg:px-0">
          {clinic.usps.map((u, i) => {
            const Icon = getIcon(u.icon);
            return (
              <div
                key={i}
                className="group rounded-lg border border-ink-100 bg-surface p-4 transition hover:border-mint-400"
              >
                <span className="grid size-10 place-items-center rounded-md border border-brand-100 bg-brand-50 text-brand-700 transition group-hover:border-mint-400 group-hover:text-mint-600">
                  <Icon className="size-5" strokeWidth={2.2} />
                </span>
                <h3 className="mt-3 text-[13.5px] font-bold text-ink-900">
                  {tx(u.title, locale)}
                </h3>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-500">
                  {tx(u.desc, locale)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Facility gallery (3개관 + 원랩 = 당일완성 근거) */}
      <FacilityGallery />

      {/* Doctors */}
      <section className="mt-10">
        <SectionHeader
          kicker={t("doctors.kicker")}
          title={t("doctors.title")}
          subtitle={t("doctors.subtitle")}
        />
        <div className="mt-6 space-y-5 px-5">
          {clinic.doctors.map((d, i) => (
            <Reveal key={d.id} delay={i * 0.05}>
              <DoctorCard
                doctor={d}
                locale={locale}
                specialtyLabel={t("doctors.specialty")}
                featured={i === 0}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Location */}
      <section className="mt-10">
        <LocationMap />
      </section>

      {/* Consultation funnel */}
      <FinalCta />
    </div>
  );
}
