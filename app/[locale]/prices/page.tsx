import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { buildMetadata } from "@/lib/seo";
import type { Locale } from "@/lib/types";
import PriceTable from "@/components/PriceTable";
import MessengerButtons from "@/components/MessengerButtons";
import { SectionHeader } from "@/components/sections/Section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "prices" });
  return buildMetadata({
    locale: locale as Locale,
    path: "/prices",
    title: t("title"),
    description: t("metaDescription"),
  });
}

export default async function PricesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="mx-auto max-w-screen-2xl pb-12 pt-10 lg:px-6">
      <SectionHeader
        as="h1"
        kicker={t("prices.kicker")}
        title={t("prices.title")}
        subtitle={t("prices.subtitle")}
      />
      <div className="mt-8">
        <PriceTable />
      </div>
      <div className="tech-glow relative mx-5 mt-10 overflow-hidden rounded-xl border border-brand-800 bg-brand-950 p-6 text-center text-white lg:mx-10">
        <div className="tech-grid absolute inset-0 opacity-40" />
        <div className="relative">
          <p className="font-display text-[16px] font-bold">{t("reservation.title")}</p>
          <p className="mt-1 text-[12.5px] text-ink-200">{t("reservation.subtitle")}</p>
          <div className="mt-4 flex justify-center">
            <MessengerButtons placement="prices_cta" variant="row" />
          </div>
        </div>
      </div>
    </div>
  );
}
