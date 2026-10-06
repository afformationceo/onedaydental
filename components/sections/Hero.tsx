import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { ShieldCheck, BadgeCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getClinic } from "@/lib/clinic";
import { tx } from "@/lib/i18n-text";
import type { Locale } from "@/lib/types";
import LineCta from "../LineCta";
import ButtonLink from "../ButtonLink";

/**
 * 히어로 — 더 이상 씬이 자동으로 넘어가는 캐러셀이 아니다("점이 왜 있는지 의문"
 * 피드백 반영, 혼란스러운 자동전환 제거). 대신 실제 대표원장 사진을 크게 보여주고
 * (내부 사진만으로는 밋밋하다는 피드백 반영), 라미네이트・크라운・임플란트・치아미백
 * 4개 시술 바로가기를 고정 텍스트로 전부 노출한다(SEO 텍스트는 그대로 유지).
 */
export default async function Hero() {
  const t = await getTranslations("hero");
  const locale = (await getLocale()) as Locale;
  const clinic = getClinic();
  const lead = clinic.doctors[0];
  const quickLinks = t.raw("scenes") as {
    image: string;
    caption: string;
    treatment: string | null;
  }[];

  return (
    <section className="relative overflow-hidden bg-brand-950 text-white">
      <div className="tech-grid absolute inset-0 opacity-25" />
      <div className="absolute -right-24 -top-24 size-96 rounded-full bg-mint-400/15 blur-3xl" />
      <div className="absolute -bottom-32 left-0 size-80 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-screen-2xl gap-10 px-5 pb-12 pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:px-10 lg:pb-16 lg:pt-16">
        {/* Left — copy */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-mint-400/30 bg-mint-400/10 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-mint-300 backdrop-blur">
            <span className="size-1.5 rounded-full bg-mint-400 shadow-[0_0_8px] shadow-mint-400" />
            {t("badge")}
          </span>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-mono text-[13px] font-bold uppercase tracking-[0.3em] text-cyan-300">
              ONE
            </span>
            <span className="font-display text-[clamp(3.4rem,12vw,6rem)] font-bold leading-none text-mint-400">
              1
            </span>
            <span className="font-display text-[clamp(1.5rem,5vw,2.4rem)] font-bold uppercase leading-none tracking-tight text-white">
              DAY
            </span>
          </div>

          <h1 className="mt-4 font-display text-[clamp(1.9rem,6vw,3.1rem)] font-bold leading-[1.12] tracking-tight text-white">
            {t("title")}
            <br />
            <span className="bg-gradient-to-r from-mint-300 to-cyan-300 bg-clip-text text-transparent">
              {t("titleEm")}
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ink-200 lg:text-[15.5px]">
            {t("subtitle")}
          </p>

          {/* 라미네이트・크라운・임플란트・치아미백 — 전부 고정 노출(앵커텍스트) */}
          <ul className="mt-5 flex flex-wrap gap-2">
            {quickLinks
              .filter((s) => s.treatment)
              .map((s) => (
                <li key={s.treatment}>
                  <Link
                    href={`/treatments/${s.treatment}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[12.5px] font-bold text-ink-100 backdrop-blur transition hover:border-mint-400/50 hover:bg-white/10 hover:text-white"
                  >
                    {s.caption}
                  </Link>
                </li>
              ))}
          </ul>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            {/* 단일 회수 경로 — LINE (브리프 §5). 폼/예약 페이지와 경쟁시키지 않는다. */}
            <LineCta placement="hero" label={t("ctaPrimary")} />
            <ButtonLink href="/prices" variant="outline">
              {t("ctaSecondary")}
            </ButtonLink>
          </div>

          <div className="mt-5 inline-flex items-center gap-2 font-mono text-[12px] font-bold tracking-wide text-mint-300">
            <ShieldCheck className="size-4" strokeWidth={2.3} />
            {t("trustSamePrice")}
          </div>
        </div>

        {/* Right — 대표원장 실제 사진(고정, 캐러셀 아님) */}
        {lead && (
          <Link
            href="/about"
            className="group bracket relative block overflow-hidden rounded-xl border border-white/10"
          >
            <div className="relative aspect-[4/5] w-full sm:aspect-[6/7] lg:aspect-[5/6]">
              <Image
                src={lead.photo}
                alt={tx(lead.name, locale)}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-top transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-mint-400 px-2.5 py-1 text-[11px] font-bold text-brand-950">
                  <BadgeCheck className="size-3.5" strokeWidth={2.4} />
                  {t("doctorBadge")}
                </span>
                <p className="mt-2 font-display text-[20px] font-bold text-white">
                  {tx(lead.name, locale)}
                </p>
                <p className="text-[13px] font-semibold text-mint-300">
                  {tx(lead.title, locale)}
                </p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
