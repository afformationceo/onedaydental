import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { getClinic } from "@/lib/clinic";
import { tx } from "@/lib/i18n-text";
import type { Locale } from "@/lib/types";
import { getIcon } from "@/lib/icons";
import { SectionHeader } from "./Section";
import Reveal from "../Reveal";

export default async function UspSection() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("usp");
  const clinic = getClinic();

  return (
    <section className="bg-surface py-14 lg:py-20">
      <div className="mx-auto max-w-screen-2xl lg:px-6">
        <SectionHeader kicker={t("kicker")} title={t("title")} />

        {/* Bento — featured photo spans wide; tech cards in asymmetric grid */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-ink-100 bg-ink-100 lg:grid-cols-4">
          {clinic.usps.map((u, i) => {
            const Icon = getIcon(u.icon);

            // Featured USP with a real facility photo (ONE LAB) — spans wide.
            if (u.image) {
              return (
                <Reveal key={i} delay={i * 0.05} className="col-span-2 lg:col-span-2">
                  <div className="relative h-full min-h-[220px] overflow-hidden bg-brand-950">
                    <Image
                      src={u.image}
                      alt={tx(u.title, locale)}
                      fill
                      sizes="(max-width: 1024px) 100vw, 640px"
                      className="object-cover opacity-65"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/40 to-transparent" />
                    <div className="tech-grid absolute inset-0 opacity-40" />
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <span className="inline-grid size-10 place-items-center rounded-lg bg-mint-400 text-brand-950 shadow-lg">
                        <Icon className="size-[20px]" strokeWidth={2.3} />
                      </span>
                      <h3 className="mt-3 font-display text-[17px] font-bold text-white">
                        {tx(u.title, locale)}
                      </h3>
                      <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-ink-200">
                        {tx(u.desc, locale)}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            }

            // 마지막 카드 — 2열(모바일)/4열(데스크톱) 그리드에서 남는 빈칸을 채우려고
            // 2칸을 차지하게 한다(featured 카드 1개 + 일반 5개 = 홀수라 안 하면
            // 모바일·데스크톱 둘 다 마지막 줄에 빈 회색 셀이 하나 남는다).
            const isLast = i === clinic.usps.length - 1;
            return (
              <Reveal key={i} delay={i * 0.05} className={isLast ? "col-span-2" : undefined}>
                <div className="group relative flex h-full flex-col bg-surface p-5 transition hover:bg-surface-soft">
                  <span className="font-mono text-[11px] font-bold tracking-widest text-mint-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-3 grid size-14 place-items-center rounded-xl bg-gradient-to-br from-brand-900 to-brand-700 text-mint-400 shadow-md shadow-brand-900/20 transition group-hover:from-brand-800 group-hover:to-brand-600">
                    <Icon className="size-[25px]" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-4 text-[14.5px] font-bold leading-tight text-ink-900">
                    {tx(u.title, locale)}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-500">
                    {tx(u.desc, locale)}
                  </p>
                  <span className="mt-4 h-px w-full bg-gradient-to-r from-mint-400/0 via-mint-400/40 to-mint-400/0 opacity-0 transition group-hover:opacity-100" />
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
