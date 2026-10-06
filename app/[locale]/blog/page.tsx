import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SectionHeader } from "@/components/sections/Section";
import BlogCard from "@/components/blog/BlogCard";
import ChannelHub from "@/components/blog/ChannelHub";
import { getAllPosts } from "@/lib/blog";
import { buildMetadata } from "@/lib/seo";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/types";
import { FileText } from "lucide-react";

// 예약 발행: ISR 로 매시간 재생성 → 공개일이 된 글이 목록에 자동 등장(재배포 불필요).
export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const COPY: Record<Locale, { kicker: string; title: string; subtitle: string; empty: string; hubTitle: string }> = {
  "zh-TW": {
    kicker: "ONEDAY 部落格",
    title: "渡韓看牙・牙齒美學 完整指南",
    subtitle:
      "陶瓷貼片、牙齒美白、植牙到渡韓流程 — 由首爾江南 ONEDAY 牙科，為台灣患者整理的真實資訊。",
    empty: "專欄即將上線，敬請期待。",
    hubTitle: "想直接諮詢？",
  },
  ko: {
    kicker: "ONEDAY 블로그",
    title: "도한 치과·치아 심미 가이드",
    subtitle: "라미네이트·미백·임플란트부터 도한 절차까지, 강남 원데이치과가 정리한 정보.",
    empty: "곧 블로그가 공개됩니다.",
    hubTitle: "바로 상담하시겠어요?",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = COPY[locale as Locale];
  return buildMetadata({
    locale: locale as Locale,
    path: "/blog",
    title: copy.title,
    description: copy.subtitle,
  });
}

export default async function BlogIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as Locale;
  const copy = COPY[locale];
  const posts = getAllPosts(locale);

  return (
    <div className="mx-auto max-w-5xl px-5 pb-16 pt-8 lg:px-6">
      <SectionHeader kicker={copy.kicker} title={copy.title} subtitle={copy.subtitle} />

      {posts.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-2xl border border-dashed border-ink-200 bg-surface-soft px-6 py-16 text-center">
          <FileText className="size-9 text-ink-300" />
          <p className="mt-3 text-[14px] font-medium text-ink-500">{copy.empty}</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {posts.map((post, i) => (
            <BlogCard
              key={post.slug}
              post={post}
              locale={locale}
              priority={i === 0}
              featured={i === 0}
            />
          ))}
        </div>
      )}

      <div className="mt-12">
        <ChannelHub title={copy.hubTitle} />
      </div>
    </div>
  );
}
