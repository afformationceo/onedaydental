// ============================================================
// 블로그 바이라인(E-E-A-T) — 작성 의사 · 의학 감수 · 편집 표기
// 머리말 키: author(문자열), reviewer({id,name,title,profile_url} 또는 문자열), editor(문자열), updatedAt.
// 값이 없으면 null → 화면·JSON-LD 모두 해당 칸을 숨긴다(기존 글 렌더 불변).
// 의사 정보는 database/clinic.json doctors 가 SSOT — id 또는 이름이 일치하면 직함·프로필을 채운다.
// ============================================================

import "server-only";
import { getClinic } from "./clinic";
import { tx } from "./i18n-text";
import type { Locale } from "./types";

export interface BylinePerson {
  name: string;
  title?: string;
  /** 사이트 내부 경로(예: /doctor/kim-jinhwan) 또는 절대 URL */
  url?: string;
}

export type ReviewerField =
  | string
  | { id?: string; name?: string; title?: string; profile_url?: string };

/**
 * SEO Gap-3 — Google helpful content guide "Who created the content" 전용 프로필을 가진
 * 의사 id 화이트리스트. 여기 등재된 의사만 /doctor/<id> 전용 페이지로 바이라인 URL 을 건다.
 * 나머지는 치과 소개(/about) 페이지로 묶여 있다.
 * 추가 의사 프로필을 만들 때 이 상수 + app/[locale]/doctor/[slug]/page.tsx PROFILE_IDS 를 함께 갱신.
 */
const DOCTOR_PROFILE_IDS = new Set<string>(["kim-jinhwan"]);
const FALLBACK_PROFILE_PATH = "/about";

function profilePathFor(id: string): string {
  return DOCTOR_PROFILE_IDS.has(id) ? `/doctor/${id}` : FALLBACK_PROFILE_PATH;
}

function findDoctor(idOrName: string | undefined) {
  if (!idOrName) return null;
  const key = idOrName.trim();
  return (
    getClinic().doctors.find(
      (d) =>
        d.id === key ||
        Object.values(d.name).some((n) => n && key.includes(n)),
    ) ?? null
  );
}

/** author 문자열이 의료진(clinic.json doctors)과 일치할 때만 Person 으로 본다. 브랜드 표기("ONEDAY")는 null. */
export function resolveAuthorDoctor(author: string | undefined, locale: Locale): BylinePerson | null {
  const d = findDoctor(author);
  if (!d) return null;
  return { name: tx(d.name, locale), title: tx(d.title, locale), url: profilePathFor(d.id) };
}

/** reviewer 머리말 → 표시용 Person. 없거나 이름을 못 정하면 null. */
export function resolveReviewer(reviewer: ReviewerField | undefined, locale: Locale): BylinePerson | null {
  if (!reviewer) return null;
  if (typeof reviewer === "string") {
    const d = findDoctor(reviewer);
    if (d) return { name: tx(d.name, locale), title: tx(d.title, locale), url: profilePathFor(d.id) };
    return reviewer.trim() ? { name: reviewer.trim() } : null;
  }
  const d = findDoctor(reviewer.id) ?? findDoctor(reviewer.name);
  const name = reviewer.name?.trim() || (d ? tx(d.name, locale) : "");
  if (!name) return null;
  return {
    name,
    title: reviewer.title?.trim() || (d ? tx(d.title, locale) : undefined),
    url: reviewer.profile_url?.trim() || (d ? profilePathFor(d.id) : undefined),
  };
}

export function resolveEditor(editor: string | undefined): string | null {
  return typeof editor === "string" && editor.trim() ? editor.trim() : null;
}
