export const revalidate = 3600;
import type { MetadataRoute } from "next";
import { getClinic } from "@/lib/clinic";
import { getAllPosts } from "@/lib/blog";
import { SITE_URL } from "@/lib/config";
import { routing } from "@/i18n/routing";

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
      lastModified: new Date("2026-06-24"),
      changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
      priority: path === "" ? 1 : path.startsWith("/treatments/") ? 0.7 : 0.8,
    });
  }

  // Blog posts — public locale (zh-TW) only; ko is a noindex review build.
  for (const post of getAllPosts(routing.defaultLocale)) {
    entries.push({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  return entries;
}
