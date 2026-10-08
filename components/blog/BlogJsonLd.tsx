// ============================================================
// BlogJsonLd — 글 1개당 구조화데이터 3종
//   1) BlogPosting  → 구글 뉴스/디스커버·기사 리치결과
//   2) FAQPage      → AEO 핵심. AI 검색·구글 FAQ 리치스니펫
//   3) BreadcrumbList → 검색결과 경로 표시 + 내부링크 신호
// SAME_AS 로 공식 채널을 publisher.sameAs 에 연결 → 백링크 권위 상호강화.
// ============================================================

import { SITE_URL } from "@/lib/config";
import { SAME_AS } from "@/lib/channels";
import type { BlogPost } from "@/lib/blog";
import { localeMeta, routing } from "@/i18n/routing";
import type { Locale } from "@/lib/types";
import { resolveAuthorDoctor, resolveReviewer, resolveEditor, type BylinePerson } from "@/lib/byline";

function jsonLdScript(node: object, key: string) {
  // `</script>` 탈출 방어 — 콘텐츠는 사내 통제(빌드타임 MDX)지만 방어적으로 `<` 이스케이프.
  const html = JSON.stringify(node).replace(/</g, "\\u003c");
  return (
    <script
      key={key}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function BlogJsonLd({
  post,
  locale,
  url,
}: {
  post: BlogPost;
  locale: Locale;
  url: string; // canonical absolute URL of this post
}) {
  const inLanguage = localeMeta[locale].htmlLang;
  const image = `${SITE_URL}${post.cover}`;

  const publisher = {
    "@type": "MedicalOrganization",
    "@id": `${SITE_URL}/#clinic`,
    name: locale === "ko" ? "원데이치과" : "韓國oneday牙科",
    url: SITE_URL,
    sameAs: SAME_AS,
  };

  // 작성 의사(Person/Physician) — author 가 의료진과 일치할 때만. 브랜드 표기 글은 기존대로 Organization.
  const absUrl = (u?: string) => (u ? (u.startsWith("/") ? `${SITE_URL}${u}` : u) : undefined);
  const physician = (p: BylinePerson) => ({
    "@type": "Physician",
    name: p.name,
    ...(p.title ? { jobTitle: p.title } : {}),
    ...(p.url ? { url: absUrl(p.url) } : {}),
    worksFor: { "@id": `${SITE_URL}/#clinic` },
  });
  const authorDoctor = resolveAuthorDoctor(post.author, locale);
  const reviewer = resolveReviewer(post.reviewer, locale);
  const editor = resolveEditor(post.editor);

  const article = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: post.description,
    image: [image],
    inLanguage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: authorDoctor
      ? physician(authorDoctor)
      : { "@type": "Organization", name: publisher.name, url: SITE_URL },
    ...(reviewer ? { reviewedBy: physician(reviewer) } : {}),
    ...(editor ? { editor: { "@type": "Organization", name: editor } } : {}),
    publisher,
    about: { "@type": "MedicalSpecialty", name: "Dentistry" },
    keywords: post.keywords.join(", "),
  };

  const faqPage =
    post.faq && post.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${url}#faq`,
          inLanguage,
          mainEntity: post.faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  const blogLabel = locale === "ko" ? "블로그" : "部落格";
  // localePrefix: "as-needed" — default locale(zh-TW)은 prefix 없음. seo.ts/sitemap 과 동일 SSOT.
  const localePrefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: blogLabel,
        item: `${SITE_URL}${localePrefix}/blog`,
      },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      {jsonLdScript(article, "article")}
      {faqPage && jsonLdScript(faqPage, "faq")}
      {jsonLdScript(breadcrumb, "breadcrumb")}
    </>
  );
}
