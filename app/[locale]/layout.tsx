import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Noto_Sans_TC } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing, localeMeta, type Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { analytics } from "@/lib/config";
import AppShell from "@/components/AppShell";
import Analytics from "@/components/Analytics";
import JsonLd from "@/components/JsonLd";
import "../globals.css";

// zh-TW(번체) 본문 글자는 Pretendard가 커버하지 못한다(한글 전용 폰트) — 기존엔
// globals.css 에 "Noto Sans TC" 이름만 적혀있고 실제로 로드하는 곳이 없어서,
// 해당 시스템 폰트가 없는 기기에서는 브라우저 기본 서체로 깨져 보였다.
// next/font/google 로 자체 호스팅 + swap + preload 를 한 번에 해결한다.
const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-sans-tc",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l = hasLocale(routing.locales, locale) ? (locale as Locale) : "zh-TW";
  return {
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://tw.onedaydent.com",
    ),
    ...buildMetadata({ locale: l, path: "/" }),
    verification: analytics.gscVerification
      ? { google: analytics.gscVerification }
      : undefined,
    icons: { icon: "/favicon.svg" },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const l = locale as Locale;

  return (
    <html lang={localeMeta[l].htmlLang} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* Display + mono — clean medical-tech voice (Latin/numerals only;
            zh-TW body stays on Pretendard + Noto Sans TC). */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap"
        />
      </head>
      <body className={notoSansTC.variable}>
        <NextIntlClientProvider>
          <JsonLd locale={l} />
          <AppShell>{children}</AppShell>
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
