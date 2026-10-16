// ============================================================
// TreatmentJsonLd — 시술 상세페이지 구조화데이터 2종 (GEO/AEO)
//   1) MedicalWebPage → 작성·검수 의사(Physician)·수정일 → AI 인용 신뢰 신호
//   2) FAQPage        → AI 검색·구글 FAQ 리치스니펫
// BlogJsonLd와 동일한 패턴(lib/byline.ts resolveAuthorDoctor/resolveReviewer) 재사용.
// ============================================================

import { SITE_URL } from "@/lib/config";
import { SAME_AS } from "@/lib/channels";
import { tx } from "@/lib/i18n-text";
import { resolveAuthorDoctor, resolveReviewer, type BylinePerson } from "@/lib/byline";
import { localeMeta } from "@/i18n/routing";
import type { Locale, Treatment, TreatmentDetail } from "@/lib/types";

function jsonLdScript(node: object, key: string) {
  const html = JSON.stringify(node).replace(/</g, "\\u003c");
  return (
    <script key={key} type="application/ld+json" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export default function TreatmentJsonLd({
  treatment,
  detail,
  locale,
  url,
}: {
  treatment: Treatment;
  detail: TreatmentDetail;
  locale: Locale;
  url: string; // canonical absolute URL
}) {
  const inLanguage = localeMeta[locale].htmlLang;
  const name = tx(treatment.name, locale);

  const publisher = {
    "@type": "MedicalOrganization",
    "@id": `${SITE_URL}/#clinic`,
    name: locale === "ko" ? "원데이치과" : "韓國oneday牙科",
    url: SITE_URL,
    sameAs: SAME_AS,
  };

  const absUrl = (u?: string) => (u ? (u.startsWith("/") ? `${SITE_URL}${u}` : u) : undefined);
  const physician = (p: BylinePerson) => ({
    "@type": "Physician",
    name: p.name,
    ...(p.title ? { jobTitle: p.title } : {}),
    ...(p.url ? { url: absUrl(p.url) } : {}),
    worksFor: { "@id": `${SITE_URL}/#clinic` },
  });
  const authorDoctor = resolveAuthorDoctor(detail.author, locale);
  const reviewer = resolveReviewer(detail.reviewer, locale);

  const medicalPage = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": `${url}#medicalwebpage`,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    name,
    inLanguage,
    ...(detail.updatedAt ? { dateModified: detail.updatedAt, lastReviewed: detail.updatedAt } : {}),
    author: authorDoctor
      ? physician(authorDoctor)
      : { "@type": "Organization", name: publisher.name, url: SITE_URL },
    ...(reviewer ? { reviewedBy: physician(reviewer) } : {}),
    publisher,
    about: { "@type": "MedicalProcedure", name },
    specialty: "Dentistry",
  };

  const faqPage =
    detail.faq && detail.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${url}#faq`,
          inLanguage,
          mainEntity: detail.faq.map((f) => ({
            "@type": "Question",
            name: tx(f.q, locale),
            acceptedAnswer: { "@type": "Answer", text: tx(f.a, locale) },
          })),
        }
      : null;

  return (
    <>
      {jsonLdScript(medicalPage, "treatment-medicalwebpage")}
      {faqPage && jsonLdScript(faqPage, "treatment-faq")}
    </>
  );
}
