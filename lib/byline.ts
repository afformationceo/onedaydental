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
  /** 사이트 내부 경로(예: /about) 또는 절대 URL */
  url?: string;
}

export type ReviewerField =
  | string
  | { id?: string; name?: string; title?: string; profile_url?: string };

const DOCTOR_PROFILE_PATH = "/about";

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
  return { name: tx(d.name, locale), title: tx(d.title, locale), url: DOCTOR_PROFILE_PATH };
}

/** reviewer 머리말 → 표시용 Person. 없거나 이름을 못 정하면 null. */
export function resolveReviewer(reviewer: ReviewerField | undefined, locale: Locale): BylinePerson | null {
  if (!reviewer) return null;
  if (typeof reviewer === "string") {
    const d = findDoctor(reviewer);
    if (d) return { name: tx(d.name, locale), title: tx(d.title, locale), url: DOCTOR_PROFILE_PATH };
    return reviewer.trim() ? { name: reviewer.trim() } : null;
  }
  const d = findDoctor(reviewer.id) ?? findDoctor(reviewer.name);
  const name = reviewer.name?.trim() || (d ? tx(d.name, locale) : "");
  if (!name) return null;
  return {
    name,
    title: reviewer.title?.trim() || (d ? tx(d.title, locale) : undefined),
    url: reviewer.profile_url?.trim() || (d ? DOCTOR_PROFILE_PATH : undefined),
  };
}

export function resolveEditor(editor: string | undefined): string | null {
  return typeof editor === "string" && editor.trim() ? editor.trim() : null;
}
