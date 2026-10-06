import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getClinic, getTreatmentBySlug, getTreatmentDetail } from "@/lib/clinic";
import { tx } from "@/lib/i18n-text";
import { buildMetadata } from "@/lib/seo";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/types";
import { Clock, Activity, Check, ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";
import MessengerButtons from "@/components/MessengerButtons";
import { SectionHeader } from "@/components/sections/Section";
import TreatmentImage from "@/components/TreatmentImage";
import { CATEGORY_ICON } from "@/components/TreatmentCard";
import { getAllPosts } from "@/lib/blog";
import BlogCard from "@/components/blog/BlogCard";

export function generateStaticParams() {
  const clinic = getClinic();
  return routing.locales.flatMap((locale) =>
    clinic.treatments.map((tr) => ({ locale, slug: tr.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const tr = getTreatmentBySlug(slug);
  if (!tr) return {};
  const detail = getTreatmentDetail(slug);
  const desc = detail
    ? tx(detail.lead, locale as Locale)
    : tx(tr.description, locale as Locale);
  return buildMetadata({
    locale: locale as Locale,
    path: `/treatments/${slug}`,
    title: `${tx(tr.hook, locale as Locale)} | ${tx(tr.name, locale as Locale)}`,
    description: desc.slice(0, 155),
  });
}

export default async function TreatmentDetail({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as Locale;
  const t = await getTranslations();
  const tr = getTreatmentBySlug(slug);
  if (!tr) notFound();
  const detail = getTreatmentDetail(slug);
  const name = tx(tr.name, locale);
  const relatedPosts = getAllPosts(locale)
    .filter((p) => p.relatedTreatments?.includes(slug))
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-5xl pb-12 lg:px-6">
      {/* Hero — navy framed, 더 크고 가시적으로 */}
      <div className="relative aspect-[4/3] max-h-[480px] w-full overflow-hidden sm:aspect-[16/9] lg:mt-6 lg:rounded-xl">
        <TreatmentImage
          src={tr.image}
          alt={name}
          icon={CATEGORY_ICON[tr.category] ?? "Sparkles"}
          priority
          sizes="(max-width: 1024px) 100vw, 768px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950/90 via-brand-950/30 to-brand-950/5" />
        <div className="tech-grid absolute inset-0 opacity-30" />
        <Link
          href="/treatments"
          className="absolute left-4 top-4 grid size-9 place-items-center rounded-lg bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
          aria-label={t("common.backHome")}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <span className="rounded-md bg-mint-400 px-2.5 py-1 text-[11px] font-bold text-brand-950">
            {tx(tr.tagline, locale)}
          </span>
          <h1 className="mt-2.5 font-display text-[clamp(1.7rem,6vw,2.7rem)] font-bold leading-tight text-white">
            {tx(tr.hook, locale)}
          </h1>
          <p className="mt-1.5 text-[15px] font-semibold text-mint-200">{name}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-3 px-5 pt-6 lg:px-0">
        <div className="rounded-lg border border-ink-100 bg-surface-soft p-3.5">
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-ink-400">
            <Clock className="size-3.5 text-mint-500" /> {t("common.duration")}
          </span>
          <p className="mt-1 text-[14px] font-bold text-ink-900">{tx(tr.duration, locale)}</p>
        </div>
        <div className="rounded-lg border border-ink-100 bg-surface-soft p-3.5">
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-ink-400">
            <Activity className="size-3.5 text-mint-500" /> {t("common.recovery")}
          </span>
          <p className="mt-1 text-[14px] font-bold text-ink-900">{tx(tr.recovery, locale)}</p>
        </div>
      </div>

      {/* Lead + highlights */}
      <div className="px-5 pt-7 lg:px-0">
        <p className="text-[17px] font-semibold leading-relaxed text-ink-800">
          {detail ? tx(detail.lead, locale) : tx(tr.description, locale)}
        </p>
        {detail && (
          <p className="mt-3 text-[15px] leading-relaxed text-ink-600">
            {tx(tr.description, locale)}
          </p>
        )}
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {tr.highlights.map((h, i) => (
            <li
              key={i}
              className="inline-flex items-center gap-1.5 rounded-lg bg-surface-soft px-3.5 py-2 text-[13.5px] font-bold text-brand-700 ring-1 ring-ink-100"
            >
              <Check className="size-4 text-mint-500" strokeWidth={3} />
              {tx(h, locale)}
            </li>
          ))}
        </ul>
      </div>

      {/* Rich sections */}
      {detail && detail.sections.length > 0 && (
        <div className="mt-8 space-y-6 px-5 lg:px-0">
          {detail.sections.map((s, i) => (
            <section key={i}>
              <h2 className="flex items-center gap-2.5 font-display text-[18px] font-bold text-ink-900">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-900 font-mono text-[13px] font-bold text-mint-400">
                  {i + 1}
                </span>
                {tx(s.heading, locale)}
              </h2>
              <p className="mt-2.5 pl-[42px] text-[15px] leading-relaxed text-ink-600">
                {tx(s.body, locale)}
              </p>
            </section>
          ))}
        </div>
      )}

      {/* Mid CTA */}
      <div className="tech-glow relative mx-5 mt-8 overflow-hidden rounded-xl border border-brand-800 bg-brand-950 p-5 text-white lg:mx-0">
        <div className="tech-grid absolute inset-0 opacity-40" />
        <div className="relative">
          <p className="font-display text-[15px] font-bold">{t("cta.consultAbout", { name })}</p>
          <p className="mt-1 text-[12.5px] text-ink-200">{t("reservation.subtitle")}</p>
          <div className="mt-4">
            <MessengerButtons treatment={name} placement="treatment_detail" variant="row" />
          </div>
        </div>
      </div>

      {/* FAQ */}
      {detail && detail.faq.length > 0 && (
        <div className="mt-10 px-5 lg:px-0">
          <SectionHeader kicker="FAQ" title={t("treatments.faqTitle")} />
          <div className="mt-5 overflow-hidden rounded-xl border border-ink-100">
            {detail.faq.map((f, i) => (
              <details
                key={i}
                className="group border-b border-ink-100 bg-surface px-5 py-1 transition last:border-b-0 open:bg-surface-soft"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-[14px] font-bold text-ink-900">
                  <span className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-700 transition group-open:bg-mint-400 group-open:text-brand-950">
                      <HelpCircle className="size-4" />
                    </span>
                    {tx(f.q, locale)}
                  </span>
                  <ChevronDown className="size-5 shrink-0 text-ink-400 transition group-open:rotate-180 group-open:text-mint-500" />
                </summary>
                <p className="pb-5 pl-10 text-[13.5px] leading-relaxed text-ink-600">
                  {tx(f.a, locale)}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}

      {/* 관련 블로그 글 — blog ↔ treatment 양방향 앵커텍스트 내부링크 */}
      {relatedPosts.length > 0 && (
        <div className="mt-10 px-5 lg:px-0">
          <SectionHeader kicker="BLOG" title={t("treatments.relatedBlogTitle")} />
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {relatedPosts.map((p) => (
              <BlogCard key={p.slug} post={p} locale={locale} />
            ))}
          </div>
        </div>
      )}

      {/* Final CTA */}
      <div className="mx-5 mt-10 rounded-xl border border-mint-400/40 bg-mint-400/8 p-6 text-center lg:mx-0">
        <p className="font-display text-[16px] font-bold text-ink-900">{t("finalCta.title")}</p>
        <p className="mt-1 text-[12.5px] text-ink-500">{t("finalCta.subtitle")}</p>
        <div className="mt-4 flex justify-center">
          <MessengerButtons treatment={name} placement="treatment_final" variant="row" />
        </div>
        <Link
          href="/reservation"
          className="mt-3 inline-block text-[12.5px] font-bold text-brand-700 underline underline-offset-2 hover:text-mint-600"
        >
          {t("reservation.submit")} →
        </Link>
      </div>
    </article>
  );
}
