import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Gem, Smile, Stethoscope, Sun } from "lucide-react";
import { getTreatmentBySlug } from "@/lib/clinic";
import { tx } from "@/lib/i18n-text";
import type { Locale } from "@/lib/types";
import { SectionHeader } from "./Section";
import Reveal from "../Reveal";

const ICONS = [Smile, Gem, Stethoscope, Sun];

interface StoryItem {
  slug: string;
  hook: string;
  body: string;
}

/**
 * "왜 이 시술을 원데이에서?" 스토리텔링 — 라미네이트・올세라믹・임플란트・치아미백
 * 4개 핵심 시술마다 고민(hook) → 원데이의 해결 방식(body)을 보여주고
 * 해당 시술 상세페이지・가격표로 앵커텍스트 연결한다.
 */
export default async function TreatmentStory() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("story");
  const items = t.raw("items") as StoryItem[];

  return (
    <section className="bg-surface py-14 lg:py-20">
      <div className="mx-auto max-w-screen-2xl lg:px-6">
        <SectionHeader kicker={t("kicker")} title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-9 grid gap-4 px-5 lg:grid-cols-2 lg:px-0">
          {items.map((item, i) => {
            const tr = getTreatmentBySlug(item.slug);
            if (!tr) return null;
            const Icon = ICONS[i % ICONS.length];
            const name = tx(tr.name, locale);

            return (
              <Reveal key={item.slug} delay={i * 0.05}>
                <div className="flex h-full flex-col rounded-xl border border-ink-100 bg-surface-soft p-6">
                  <span className="grid size-11 place-items-center rounded-lg border border-brand-100 bg-surface text-brand-700">
                    <Icon className="size-[21px]" strokeWidth={2.1} />
                  </span>
                  <h3 className="mt-4 font-display text-[17px] font-bold leading-snug text-ink-900">
                    {name}
                  </h3>
                  <p className="mt-2 text-[13.5px] font-semibold leading-relaxed text-ink-700">
                    {item.hook}
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-500">{item.body}</p>

                  <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-ink-100 pt-4">
                    <Link
                      href={`/treatments/${tr.slug}`}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-700 transition hover:text-mint-600"
                    >
                      {name} {t("ctaTreatment")}
                      <ArrowRight className="size-3.5" />
                    </Link>
                    <Link
                      href="/prices"
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-ink-500 transition hover:text-brand-700"
                    >
                      {t("ctaPrice")}
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
