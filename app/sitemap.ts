export const revalidate = 3600;
import type { MetadataRoute } from "next";
import { getClinic } from "@/lib/clinic";
import { getAllPosts, hreflangLanguages } from "@/lib/blog";
import { SITE_URL } from "@/lib/config";
import { routing, localeMeta } from "@/i18n/routing";
import lastmodManifest from "@/lib/generated/sitemap-lastmod.json";

// 매니페스트에 없는 경로(생성 스크립트를 아직 못 돌렸거나 git 조회 실패)를 위한
// 최후 폴백 — 실제 수정일을 모를 때 임의 날짜를 지어내는 대신, 이 사이트 최초
// 공개 시점 하나로 고정해 "모름"을 드러낸다. scripts/gen-sitemap-lastmod.mjs 참고.
const FALLBACK_LASTMOD = new Date("2026-06-24");

function lastmodFor(path: string): Date {
  const iso = (lastmodManifest as Record<string, string>)[path];
  return iso ? new Date(iso) : FALLBACK_LASTMOD;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const clinic = getClinic();
  const staticPaths = ["", "/about", "/treatments", "/prices", "/reservation", "/blog"];
  const treatmentPaths = clinic.treatments.map((tr) => `/treatments/${tr.slug}`);
  const allPaths = [...staticPaths, ...treatmentPaths];

  const entries: MetadataRoute.Sitemap = [];
  for (const path of allPaths) {
    // Single locale, no prefix → one clean URL per path.
    entries.push({
      url: `${SITE_URL}${path}`,
      lastModified: lastmodFor(path),
      changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
      priority: path === "" ? 1 : path.startsWith("/treatments/") ? 0.7 : 0.8,
    });
  }

  // Blog posts — public locale (zh-TW) only; ko is a noindex review build.
  // Gap-1 hreflang: 글마다 공개된 번역 짝만 alternates 선언. 자기 하나뿐이면 생략.
  for (const post of getAllPosts(routing.defaultLocale)) {
    const langs = hreflangLanguages(
      post.slug,
      SITE_URL,
      routing.locales,
      routing.defaultLocale,
      (l) => localeMeta[l].htmlLang,
    );
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
      changeFrequency: "monthly",
      priority: 0.6,
      ...(Object.keys(langs).length > 0 ? { alternates: { languages: langs } } : {}),
    });
  }

  // Gap-3 저자 프로필 (/doctor/kim-jinhwan) — 공개 로케일만 등록.
  entries.push({
    url: `${SITE_URL}/doctor/kim-jinhwan`,
    lastModified: lastmodFor("/doctor/kim-jinhwan"),
    changeFrequency: "yearly",
    priority: 0.5,
  });

  return entries;
}
