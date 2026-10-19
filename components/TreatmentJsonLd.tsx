// ============================================================
// TreatmentJsonLd — 치료 상세 페이지 구조화데이터
//   1) MedicalWebPage → 작성·검수 의사 + dateModified (E-E-A-T)
//   2) FAQPage        → 본문 FAQ 와 동일 문장 (AEO)
// ============================================================

import { SITE_URL } from "@/lib/config";
import { SAME_AS } from "@/lib/channels";
import { localeMeta } from "@/i18n/routing";
import { resolveAuthorDoctor, type BylinePerson } from "@/lib/byline";
import type { Locale, TreatmentDetail } from "@/lib/types";

function jsonLdScript(node: object, key: string) {
  const html = JSON.stringify(node).replace(/</g, "\\u003c");
  return <script key={key} type="application/ld+json" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function TreatmentJsonLd({
  detail,
  locale,
  url,
  name,
  description,
  faq,
}: {
  detail: TreatmentDetail;
  locale: Locale;
  url: string;
  name: string;
  description: string;
  faq: { q: string; a: string }[];
}) {
  const inLanguage = localeMeta[locale].htmlLang;
  const physician = (p: BylinePerson) => ({
    "@type": "Physician",
    name: p.name,
    ...(p.title ? { jobTitle: p.title } : {}),
    url: `${SITE_URL}${p.url ?? "/about"}`,
    worksFor: { "@id": `${SITE_URL}/#clinic` },
  });
  const author = resolveAuthorDoctor(detail.author, locale);
  const reviewer = resolveAuthorDoctor(detail.reviewer, locale);

  const page = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage,
    ...(detail.updatedAt ? { dateModified: detail.updatedAt } : {}),
    ...(author ? { author: physician(author) } : {}),
    ...(reviewer ? { reviewedBy: physician(reviewer) } : {}),
    ...(detail.updatedAt && reviewer ? { lastReviewed: detail.updatedAt } : {}),
    about: { "@type": "MedicalSpecialty", name: "Dentistry" },
    publisher: {
      "@type": "MedicalOrganization",
      "@id": `${SITE_URL}/#clinic`,
      name: locale === "ko" ? "원데이치과" : "韓國oneday牙科",
      url: SITE_URL,
      sameAs: SAME_AS,
    },
  };

  const faqPage =
    faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${url}#faq`,
          inLanguage,
          mainEntity: faq.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  return (
    <>
      {jsonLdScript(page, "webpage")}
      {faqPage && jsonLdScript(faqPage, "faq")}
    </>
  );
}
