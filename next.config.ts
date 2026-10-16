import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  outputFileTracingRoot: __dirname,
  // 2026-10-09: sitemap.xml (revalidate 3600) reads content/blog via fs at ISR time. Without the markdown
  // traced into the function, the build-time sitemap lists all posts (45 URLs) but every hourly regeneration
  // on Vercel saw no posts (16 URLs = static pages only) — the audit flip-flopped between the two.
  outputFileTracingIncludes: {
    "/sitemap.xml": ["./content/**/*"],
    "/[locale]/blog": ["./content/**/*"],
    "/[locale]/blog/[slug]": ["./content/**/*"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.healingeye.co.kr" },
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  // 옛 /reviews 페이지는 홈 #reviews 섹션으로 통합됨(72441cf) — 색인·외부 링크 404 방지.
  async redirects() {
    return [
      { source: "/reviews", destination: "/#reviews", permanent: true },
      { source: "/ko/reviews", destination: "/ko#reviews", permanent: true },
    ];
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://connect.facebook.net https://www.instagram.com",
      "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://fonts.googleapis.com",
      "font-src 'self' data: https://cdn.jsdelivr.net https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "frame-src 'self' https://www.instagram.com https://www.google.com https://maps.google.com",
      "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.facebook.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/:dir(scraped-img|gen-img)/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
