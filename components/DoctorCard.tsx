import Image from "next/image";
import { tx } from "@/lib/i18n-text";
import type { Doctor, Locale } from "@/lib/types";
import { Stethoscope, Quote } from "lucide-react";
import { cn } from "@/lib/cn";

function initials(name: string) {
  const clean = name.replace(/(Dr\.|대표원장|원장|院長|代表)/g, "").trim();
  return clean.slice(0, 2) || "HE";
}

/**
 * 대표원장(featured)은 사진·텍스트를 크게, 나머지 의료진은 기존보다 한 단계
 * 키운 카드로 — "원장님 소개 텍스트/사진이 너무 작다" 피드백 반영.
 */
export default function DoctorCard({
  doctor,
  locale,
  specialtyLabel,
  featured = false,
}: {
  doctor: Doctor;
  locale: Locale;
  specialtyLabel: string;
  featured?: boolean;
}) {
  const name = tx(doctor.name, locale);

  if (featured) {
    return (
      <article className="overflow-hidden rounded-2xl border border-ink-100 bg-surface">
        <div className="grid sm:grid-cols-[minmax(0,280px)_1fr]">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-brand-950 sm:aspect-auto sm:min-h-[340px]">
            {doctor.photo ? (
              <Image
                src={doctor.photo}
                alt={name}
                fill
                priority
                sizes="(max-width: 640px) 100vw, 280px"
                className="object-cover object-top"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-4xl font-bold text-mint-400">
                {initials(name)}
              </div>
            )}
          </div>
          <div className="p-6 sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint-400/15 px-3 py-1 text-[12px] font-bold text-mint-600">
              {specialtyLabel}
            </span>
            <h3 className="mt-3 font-display text-[28px] font-bold leading-tight text-ink-900 sm:text-[32px]">
              {name}
            </h3>
            <p className="mt-1 text-[16px] font-bold text-brand-700">{tx(doctor.title, locale)}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-surface-soft px-3 py-1.5 text-[13px] font-semibold text-ink-700 ring-1 ring-ink-100">
              <Stethoscope className="size-4 text-mint-500" />
              {tx(doctor.specialty, locale)}
            </span>

            <ul className="mt-5 grid gap-x-5 gap-y-2.5 border-t border-ink-100 pt-5 sm:grid-cols-2">
              {doctor.career.map((c, i) => (
                <li key={i} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-700">
                  <Quote className="mt-0.5 size-4 shrink-0 text-mint-500" />
                  <span>{tx(c, locale)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="overflow-hidden rounded-xl border border-ink-100 bg-surface transition hover:border-mint-400">
      <div className="flex gap-4 p-5">
        <div className="relative size-28 shrink-0 overflow-hidden rounded-lg ring-1 ring-ink-100">
          {doctor.photo ? (
            <Image
              src={doctor.photo}
              alt={name}
              fill
              sizes="112px"
              className="object-cover object-top"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-brand-900 text-2xl font-bold text-mint-400">
              {initials(name)}
            </div>
          )}
        </div>
        <div className={cn("min-w-0 flex-1")}>
          <h3 className="font-display text-[19px] font-bold leading-tight text-ink-900">
            {name}
          </h3>
          <p className="mt-0.5 text-[14px] font-bold text-mint-600">{tx(doctor.title, locale)}</p>
          <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-md bg-surface-soft px-2.5 py-1.5 text-[12.5px] font-semibold text-ink-600 ring-1 ring-ink-100">
            <Stethoscope className="size-4 text-mint-500" />
            {tx(doctor.specialty, locale)}
          </span>
        </div>
      </div>
      <ul className="space-y-2 border-t border-ink-100 bg-surface-soft/60 px-5 py-4">
        {doctor.career.map((c, i) => (
          <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-600">
            <Quote className="mt-0.5 size-3.5 shrink-0 text-mint-400" />
            <span>{tx(c, locale)}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
