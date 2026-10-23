// ============================================================
// /doctor/[slug] — 代表院長 프로필 (E-E-A-T 강화 · SEO Gap-3)
// Google helpful content guide: "Who created the content" 에 답하는 전용 페이지.
// 블로그 BlogJsonLd 의 author.url 이 이 페이지로 연결된다(/about 홈 섹션 → 전용 페이지).
//
// 노출 범위(보수적 운영 — 의료광고법/YMYL 가이드 준수):
//   O 이름 · 직함 · 전문 분야 · 소속 지점
//   X 학력 · 자격증 · 학회 직위 · 수술/치료 건수
//   career 배열은 clinic.json 에 있지만 이 전용 SEO 페이지에서는 노출하지 않는다
//   (학술 활동/직위 열거는 과도한 권위 어필로 해석될 수 있음).
// ============================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, MapPin, Stethoscope } from "lucide-react";
import { getClinic } from "@/lib/clinic";
import { tx } from "@/lib/i18n-text";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/types";

// 24h ISR — 프로필은 자주 바뀌지 않는다.
export const revalidate = 86400;

// SEO 전용 프로필을 보유한 의사 id 화이트리스트.
// 다른 의사는 /about 치과 소개 페이지로 묶여 있고, SEO 전용 페이지가 없다.
const PROFILE_IDS = ["kim-jinhwan"] as const;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    PROFILE_IDS.map((slug) => ({ locale, slug })),
  );
}

export const dynamicParams = false;

function findProfile(slug: string) {
  if (!(PROFILE_IDS as readonly string[]).includes(slug)) return null;
  const doctor = getClinic().doctors.find((d) => d.id === slug);
  return doctor ?? null;
}

// UI 라벨 — zh-TW(공개) / ko(내부 리뷰).
const UI: Record<
  Locale,
  { back: string; specialty: string; branches: string; aboutLink: string; onsite: string; disclaimer: string }
> = {
  "zh-TW": {
    back: "返回首頁",
    specialty: "專長領域",
    branches: "看診院區",
    aboutLink: "了解更多關於韓國oneday牙科",
    onsite: "線下看診",
    disclaimer:
      "治療效果因個人口腔狀況而異，請以實際門診評估為準。本頁僅介紹醫師看診領域，不保證特定療效。",
  },
  ko: {
    back: "홈으로",
    specialty: "전문 분야",
    branches: "진료 지점",
    aboutLink: "원데이치과 소개 보기",
    onsite: "오프라인 진료",
    disclaimer:
      "치료 결과는 구강 상태에 따라 다를 수 있으며, 실제 내원 상담에 따릅니다. 이 페이지는 의사의 진료 영역 소개이며 특정 효과를 보장하지 않습니다.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = localeParam as Locale;
  const doctor = findProfile(slug);
  if (!doctor) return {};

  const name = tx(doctor.name, locale);
  const title = tx(doctor.title, locale);
  const specialty = tx(doctor.specialty, locale);
  const pageTitle = `${name} ${title}`;
  const description =
    locale === "ko"
      ? `${name} ${title} — ${specialty}. 원데이치과(강남)에서 오프라인 진료.`
      : `${name} ${title} — ${specialty}。於韓國oneday牙科（首爾江南）線下看診。`;

  const meta = buildMetadata({ locale, path: `/doctor/${slug}`, title: pageTitle, description });

  // Gap-1 hreflang — /doctor/<id> 는 공개 로케일(zh-TW) 전용. ko 는 noindex 유지(buildMetadata 가 처리).
  // 번역 짝이 늘어나면 여기도 알아서 확장(현재는 사이트 전역 fallback 사용).
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "profile",
      images: [{ url: `${SITE_URL}${doctor.photo}`, width: 800, height: 1000 }],
    },
  };
}

function PhysicianJsonLd({ doctor, locale, url }: { doctor: ReturnType<typeof findProfile>; locale: Locale; url: string }) {
  if (!doctor) return null;
  const name = tx(doctor.name, locale);
  const title = tx(doctor.title, locale);
  const specialty = tx(doctor.specialty, locale);
  const brand = locale === "ko" ? "원데이치과" : "韓國oneday牙科";
  const ld = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${url}#doctor`,
    name,
    jobTitle: title,
    medicalSpecialty: "Dentistry",
    image: `${SITE_URL}${doctor.photo}`,
    url,
    worksFor: {
      "@type": "Dentist",
      "@id": `${SITE_URL}/#clinic`,
      name: brand,
      url: SITE_URL,
    },
    // 포괄적 전문 분야 — 세부 시술 리스트는 사이트 /treatments 로 유도.
    knowsAbout: specialty.split(/[,、・，]\s*/).filter(Boolean),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(ld).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as Locale;
  const doctor = findProfile(slug);
  if (!doctor) notFound();

  const ui = UI[locale];
  const name = tx(doctor.name, locale);
  const title = tx(doctor.title, locale);
  const specialty = tx(doctor.specialty, locale);
  const altText =
    locale === "ko"
      ? `${name} ${title} 사진 — 원데이치과`
      : `${name} ${title}照片 — 韓國oneday牙科`;
  const canonical = `${SITE_URL}${locale === routing.defaultLocale ? "" : `/${locale}`}/doctor/${slug}`;

  // 소속 지점 — 임플란트/교합 중심 → 1·2관 (3관은 교정·기타). clinic.json 라벨 그대로.
  const clinic = getClinic();
  const relevantBranches = clinic.branches.filter((b) => b.id === "hall-1" || b.id === "hall-2");

  return (
    <>
      <PhysicianJsonLd doctor={doctor} locale={locale} url={canonical} />

      <article className="mx-auto max-w-3xl px-5 pb-16 pt-6 lg:px-0">
        <Link
          href="/"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-ink-500 transition hover:text-brand-700"
        >
          <ArrowLeft className="size-4" /> {ui.back}
        </Link>

        <header className="mt-6 grid items-start gap-6 md:grid-cols-[220px_1fr] md:gap-10">
          <div className="relative mx-auto aspect-[4/5] w-[55%] max-w-[220px] overflow-hidden rounded-2xl border border-ink-100 bg-surface-muted md:w-full">
            <Image
              src={doctor.photo}
              alt={altText}
              fill
              priority
              sizes="(max-width: 768px) 50vw, 220px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-[12.5px] font-bold uppercase tracking-wide text-brand-700">
              {locale === "ko" ? "원데이치과 대표원장" : "韓國oneday牙科 院長"}
            </p>
            <h1 className="mt-2 font-display text-[clamp(1.7rem,5.2vw,2.4rem)] font-bold leading-[1.18] tracking-tight text-ink-900">
              {name}
            </h1>
            <p className="mt-2 text-[15px] text-ink-500">{title}</p>
            <p className="mt-5 text-[15px] leading-relaxed text-ink-700">
              {locale === "ko"
                ? "강남 원데이치과에서 임플란트·T-Scan 교합 치료를 중심으로 환자를 봅니다. 디지털 정밀 진단을 바탕으로 내원 횟수를 줄인 치료를 지향합니다."
                : "於首爾江南 韓國oneday牙科 以植牙與 T-Scan 咬合治療為主進行診療。以數位精密診斷為基礎，致力於減少看診次數的治療流程。"}
            </p>
          </div>
        </header>

        <section className="mt-10 md:mt-14">
          <h2 className="flex items-center gap-2 font-display text-[1.3rem] font-bold text-ink-900">
            <Stethoscope className="size-5 text-mint-500" /> {ui.specialty}
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {specialty
              .split(/[,、・，]\s*/)
              .filter(Boolean)
              .map((item) => (
                <li
                  key={item}
                  className="rounded-md border border-ink-100 bg-surface px-3 py-1.5 text-[13.5px] font-semibold text-ink-700"
                >
                  {item}
                </li>
              ))}
          </ul>
        </section>

        <section className="mt-10 md:mt-14">
          <h2 className="flex items-center gap-2 font-display text-[1.3rem] font-bold text-ink-900">
            <MapPin className="size-5 text-mint-500" /> {ui.branches}
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {relevantBranches.map((b) => (
              <li
                key={b.id}
                className="rounded-xl border border-ink-100 bg-surface px-4 py-3.5"
              >
                <p className="text-[14px] font-bold text-ink-900">{tx(b.name, locale)}</p>
                <p className="mt-1 text-[12.5px] text-ink-500">{tx(b.address, locale)}</p>
                <p className="mt-1 text-[12px] text-ink-400">{ui.onsite} · {tx(b.services, locale)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10 md:mt-14">
          <Link
            href="/about"
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-700 underline-offset-2 hover:underline"
          >
            {ui.aboutLink}
          </Link>
        </section>

        <p className="mt-10 text-[11.5px] leading-relaxed text-ink-400">
          {ui.disclaimer}
        </p>
      </article>
    </>
  );
}

