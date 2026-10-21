import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { getClinic } from "@/lib/clinic";
import { tx } from "@/lib/i18n-text";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import { getIcon } from "@/lib/icons";
import TreatmentCard from "@/components/TreatmentCard";
import { SectionHeader } from "@/components/sections/Section";
import Reveal from "@/components/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "categories" });
  return buildMetadata({
    locale: locale as Locale,
    path: "/treatments",
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default async function TreatmentsPage({
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
    <div className="mx-auto max-w-screen-2xl pb-12 pt-10 lg:px-6">
      <SectionHeader
        as="h1"
        kicker={t("categories.kicker")}
        title={t("categories.title")}
        subtitle={t("categories.subtitle")}
      />

      <div className="mt-9 space-y-12">
        {clinic.categories.map((cat) => {
          const items = clinic.treatments.filter((tr) => tr.category === cat.id);
          if (items.length === 0) return null;
          const Icon = getIcon(cat.icon);
          return (
            <div key={cat.id} id={`cat-${cat.id}`} className="scroll-mt-20">
              <div className="mb-5 flex items-center gap-3 border-b border-ink-100 px-5 pb-3 lg:px-0">
                <span className="grid size-9 place-items-center rounded-lg bg-brand-900 text-mint-400">
                  <Icon className="size-5" strokeWidth={2.2} />
                </span>
                <h2 className="font-display text-[19px] font-bold tracking-tight text-ink-900">
                  {tx(cat.name, locale)}
                </h2>
                <span className="ml-auto font-mono text-[12px] font-bold text-ink-300">
                  {String(items.length).padStart(2, "0")}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4 px-5 md:grid-cols-2 lg:grid-cols-3 lg:px-0">
                {items.map((tr, i) => (
                  <Reveal key={tr.id} delay={i * 0.04}>
                    <TreatmentCard
                      treatment={tr}
                      locale={locale}
                      durationLabel={t("common.duration")}
                      recoveryLabel={t("common.recovery")}
                    />
                  </Reveal>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
