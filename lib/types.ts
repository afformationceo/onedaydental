// ============================================================
// 원데이치과 — content schema (single source of truth)
// Scraper output (raw_scrape.json) is normalized into clinic.json
// matching this shape. UI reads only typed data — never raw HTML.
// ============================================================

// Site locales come from the i18n routing config (zh-TW public + ko review-only).
// Single source of truth = i18n/routing.ts.
import type { Locale as RoutingLocale } from "@/i18n/routing";
export type Locale = RoutingLocale;

/** A string that may be localized. Falls back zh-TW -> legacy ko -> first available. */
export type I18nText = Partial<Record<Locale, string>> & { ko?: string };

export interface Doctor {
  id: string;
  name: I18nText;
  title: I18nText; // 직책 e.g. 대표원장
  specialty: I18nText;
  photo: string; // /scraped-img/...
  career: I18nText[]; // bullet list of real career lines
}

export interface Treatment {
  id: string;
  slug: string;
  category: TreatmentCategoryId;
  name: I18nText;
  tagline: I18nText;
  hook: I18nText; // 후킹용 질문형 제목 ("라미네이트 찾으시나요?")
  description: I18nText;
  duration: I18nText; // 시술 시간
  recovery: I18nText; // 회복 기간
  image: string;
  highlights: I18nText[]; // 핵심 포인트
}

export interface TreatmentDetailSection {
  heading: I18nText;
  body: I18nText;
}
export interface TreatmentFaq {
  q: I18nText;
  a: I18nText;
}
export interface TreatmentDetail {
  lead: I18nText;
  sections: TreatmentDetailSection[];
  faq: TreatmentFaq[];
}
export type TreatmentDetailMap = Record<string, TreatmentDetail>;

export type TreatmentCategoryId =
  | "implant" // 원데이 임플란트 (즉시식립·플라즈마·무치악)
  | "tscan" // T-Scan 디지털 교합 분석·교정
  | "ortho" // 치아교정 (투명·설측·어린이)
  | "cosmetic" // 치아성형·심미 (라미네이트·올세라믹·미백)
  | "general"; // 일반진료 (충치·잇몸·보철)

export interface TreatmentCategory {
  id: TreatmentCategoryId;
  name: I18nText;
  icon: string; // lucide icon name
}

export interface PriceItem {
  id: string;
  category: I18nText; // 그룹 (e.g. 임플란트)
  name: I18nText; // 시술명
  unit?: I18nText; // 단위 (1개당 / 편악 / 양악 등)
  priceKRW: number | null; // 만원 단위 가격. null = 상담문의 (range나 special은 priceText 사용)
  originalKRW?: number; // 정가(만원) — 할인 전. 있으면 취소선으로 병기 (예: 70→40)
  priceText?: I18nText; // 자유 표기 (범위 "30~50" 등 priceKRW로 표현 불가할 때 우선)
  note?: I18nText;
}

export interface Review {
  id: string;
  platform: "instagram" | "tiktok" | "youtube";
  url: string;
  country: Locale | "kr";
  rating: number; // 1-5
  treatmentTag: string; // category id or label
  caption?: I18nText;
  starName?: I18nText; // 연예인 실명 (스타 마퀴용)
  starRole?: I18nText; // 직업 (배우/가수 등)
}

export interface Usp {
  icon: string; // lucide icon name
  title: I18nText;
  desc: I18nText;
  image?: string; // optional real facility photo (e.g. ONE LAB) — /facility/...
}

/**
 * A physical branch (진료관) of the SAME clinic (韓國oneday牙科).
 * Each branch is registered as its own Google Business Profile, so its
 * NAP (name/address/phone) must map 1:1 to the Google Maps listing.
 */
export interface Branch {
  id: string; // hall-1 / hall-2 / hall-3
  name: I18nText; // 관 이름 e.g. 제1관 / 韓國oneday牙科 1館
  address: I18nText; // full street address
  phone: string;
  services: I18nText; // 이 관에서 제공하는 진료내용
  mapQuery: string; // Google Maps search query (Korean, for accurate pin)
  image?: string; // representative facility photo for this hall — /facility/...
  imageAlt?: I18nText; // localized alt text for the facility photo
}

/** Promotional photos provided by the clinic (e.g. celebrity visits). */
export interface CelebrityPhoto {
  src: string; // /celebrity/...
  alt: I18nText;
}
export interface CelebritiesData {
  title: I18nText;
  subtitle: I18nText;
  note: I18nText;
  photos: CelebrityPhoto[];
}

export interface ClinicData {
  name: I18nText;
  tagline: I18nText;
  intro: I18nText;
  address: I18nText;
  phone: string;
  branches: Branch[]; // 3개관 — same clinic, separate Google Business Profiles
  hours: I18nText[];
  certifications: I18nText[]; // 보건복지부 외국인환자 유치 등록기관 등
  usps: Usp[];
  doctors: Doctor[];
  categories: TreatmentCategory[];
  treatments: Treatment[];
  prices: PriceItem[];
  reviews: Review[];
  celebrities: CelebritiesData;
  meta: {
    scrapedAt: string | null;
    sourceUrl: string;
  };
}
