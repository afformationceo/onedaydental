import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { setRequestLocale } from "next-intl/server";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { Link } from "@/i18n/navigation";
import {
  CalendarDays,
  Clock,
  ArrowLeft,
  ChevronDown,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { getPostBySlug, getAllBlogParams, getAllPosts, CATEGORY_LABEL, isLive } from "@/lib/blog";
import { getClinic, getTreatmentBySlug } from "@/lib/clinic";
import { tx } from "@/lib/i18n-text";
import { buildMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/config";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/lib/types";
import { mdxComponents } from "@/components/blog/mdx";
import ChannelHub from "@/components/blog/ChannelHub";
import BlogJsonLd from "@/components/blog/BlogJsonLd";
import BlogCard from "@/components/blog/BlogCard";
import { resolveAuthorDoctor, resolveReviewer, resolveEditor, type BylinePerson } from "@/lib/byline";

// 예약 발행: ISR 로 매시간 재검증 + dynamicParams 로 공개일이 된 글을
// 온디맨드 렌더(재배포 불필요). 미공개 글은 isLive 게이트로 404.
export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return getAllBlogParams(routing.locales);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(locale as Locale, slug);
  if (!post || !isLive(post.publishedAt)) return {};
  const meta = buildMetadata({
    locale: locale as Locale,
    path: `/blog/${slug}`,
    title: post.title,
    description: post.description,
  });
  // 글 고유 OG 이미지 + Article 타입 + 키워드 보강
  return {
    ...meta,
    keywords: post.keywords,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      images: [{ url: `${SITE_URL}${post.cover}`, width: 1200, height: 630 }],
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
    },
  };
}

const UI: Record<Locale, { back: string; updated: string; read: string; author: string; reviewer: string; editor: string; faqTitle: string; relTreat: string; relPost: string; hubTitle: string }> = {
  "zh-TW": {
    back: "返回專欄",
    updated: "更新於",
    read: "分鐘閱讀",
    author: "作者",
    reviewer: "醫學審閱",
    editor: "編輯",
    faqTitle: "常見問題",
    relTreat: "相關療程",
    relPost: "延伸閱讀",
    hubTitle: "預約・諮詢・地圖導航",
  },
  ko: {
    back: "블로그로",
    updated: "수정일",
    read: "분 읽기",
    author: "작성",
    reviewer: "의학 감수",
    editor: "편집",
    faqTitle: "자주 묻는 질문",
    relTreat: "관련 시술",
    relPost: "함께 보기",
    hubTitle: "예약·상담·지도",
  },
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as Locale;
  const post = getPostBySlug(locale, slug);
  if (!post || !isLive(post.publishedAt)) notFound();
  const ui = UI[locale];

  // 바이라인(E-E-A-T) — 값이 있는 칸만 노출. 브랜드 author("ONEDAY")·reviewer/editor 없는 기존 글은 그대로.
  const authorDoctor = resolveAuthorDoctor(post.author, locale);
  const reviewer = resolveReviewer(post.reviewer, locale);
  const editor = resolveEditor(post.editor);

  const canonical = `${SITE_URL}${locale === routing.defaultLocale ? "" : `/${locale}`}/blog/${slug}`;

  // 내부 상호링크 — 관련 시술 / 관련 글
  const clinic = getClinic();
  const relatedTreatments = (post.relatedTreatments ?? [])
    .map((s) => getTreatmentBySlug(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));
  const allPosts = getAllPosts(locale);
  const relatedPosts = (post.relatedPosts ?? [])
    .map((s) => allPosts.find((p) => p.slug === s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 2);

  return (
    <>
      <BlogJsonLd post={post} locale={locale} url={canonical} />

      <article className="mx-auto max-w-2xl px-5 pb-16 pt-6 lg:px-0">
        {/* Breadcrumb / back */}
        <Link
          href="/blog"
          className="inline-flex min-h-[44px] items-center gap-1.5 text-[13px] font-semibold text-ink-500 transition hover:text-brand-700"
        >
          <ArrowLeft className="size-4" /> {ui.back}
        </Link>

        {/* Header */}
        <header className="mt-5">
          <span className="inline-block rounded-md bg-brand-50 px-2.5 py-1 text-[11.5px] font-bold text-brand-700">
            {CATEGORY_LABEL[post.category][locale]}
          </span>
          <h1 className="mt-3 font-display text-[clamp(1.6rem,5.2vw,2.4rem)] font-bold leading-[1.18] tracking-tight text-ink-900">
            {post.title}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-500">{post.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[11.5px] text-ink-400">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" /> {post.publishedAt}
            </span>
            {post.updatedAt && post.updatedAt !== post.publishedAt && (
              <span>
                {ui.updated} {post.updatedAt}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" /> {post.readingMinutes} {ui.read}
            </span>
          </div>
          {(authorDoctor || reviewer || editor) && (
            <dl className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-ink-500">
              {authorDoctor && <BylineItem label={ui.author} person={authorDoctor} />}
              {reviewer && <BylineItem label={ui.reviewer} person={reviewer} />}
              {editor && (
                <div className="inline-flex items-center gap-1.5">
                  <dt className="font-semibold text-ink-400">{ui.editor}</dt>
                  <dd>{editor}</dd>
                </div>
              )}
            </dl>
          )}
        </header>

        {/* Cover */}
        <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-ink-100 bg-surface-muted">
          <Image
            src={post.cover}
            alt={post.coverAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        {/* Body (MDX) */}
        <div className="mt-2">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>

        {/* FAQ — 화면 + (구조화데이터는 BlogJsonLd 가 별도 방출) */}
        {post.faq && post.faq.length > 0 && (
          <section className="mt-12">
            <h2 className="flex items-center gap-2 font-display text-[1.3rem] font-bold text-ink-900">
              <HelpCircle className="size-5 text-mint-500" /> {ui.faqTitle}
            </h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-ink-100">
              {post.faq.map((f, i) => (
                <details
                  key={i}
                  className="group border-b border-ink-100 bg-surface px-5 py-1 transition last:border-b-0 open:bg-surface-soft"
                >
                  <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-3 py-4 text-[15px] font-bold text-ink-900">
                    {f.q}
                    <ChevronDown className="size-5 shrink-0 text-ink-400 transition group-open:rotate-180 group-open:text-mint-500" />
                  </summary>
                  <p className="pb-5 text-[15px] leading-relaxed text-ink-600">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* 관련 시술 — 내부 상호링크 */}
        {relatedTreatments.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-[1.2rem] font-bold text-ink-900">{ui.relTreat}</h2>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {relatedTreatments.map((tr) => (
                <li key={tr.slug}>
                  <Link
                    href={`/treatments/${tr.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-ink-100 bg-surface px-4 py-3.5 transition hover:border-mint-400/50 hover:shadow-tech"
                  >
                    <span className="min-w-0">
                      <span className="block text-[14px] font-bold text-ink-900 group-hover:text-brand-700">
                        {tx(tr.name, locale)}
                      </span>
                      <span className="block truncate text-[12px] text-ink-400">
                        {tx(tr.tagline, locale)}
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-ink-300 transition group-hover:translate-x-0.5 group-hover:text-mint-500" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 백링크 허브 — 전 채널 상호강화 */}
        <div className="mt-12">
          <ChannelHub subtitle={ui.hubTitle} />
        </div>

        {/* 관련 글 */}
        {relatedPosts.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-[1.2rem] font-bold text-ink-900">{ui.relPost}</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {relatedPosts.map((p) => (
                <BlogCard key={p.slug} post={p} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}

function BylineItem({ label, person }: { label: string; person: BylinePerson }) {
  const text = person.title ? `${person.name} ${person.title}` : person.name;
  const isInternal = person.url?.startsWith("/");
  return (
    <div className="inline-flex items-center gap-1.5">
      <dt className="font-semibold text-ink-400">{label}</dt>
      <dd>
        {person.url ? (
          isInternal ? (
            <Link href={person.url} className="font-semibold text-ink-700 underline-offset-2 hover:text-brand-700 hover:underline">
              {text}
            </Link>
          ) : (
            <a href={person.url} className="font-semibold text-ink-700 underline-offset-2 hover:text-brand-700 hover:underline">
              {text}
            </a>
          )
        ) : (
          <span className="font-semibold text-ink-700">{text}</span>
        )}
      </dd>
    </div>
  );
}
