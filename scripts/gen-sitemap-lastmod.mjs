// sitemap.ts 가 쓰는 "실제 수정일" 매니페스트를 git 커밋 히스토리에서 생성한다.
// 각 URL의 lastmod = 그 페이지 콘텐츠를 구성하는 소스 파일들 중 가장 최근 커밋 날짜.
// git 이 없는 빌드 환경(예: 얕은 클론)에서도 빌드가 깨지지 않도록 전부 try/catch —
// 실패하면 그 URL은 건너뛰고 기존에 커밋된 매니페스트 값이 유지된다(sitemap.ts의 폴백 참고).
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const OUT = path.join(ROOT, "lib", "generated", "sitemap-lastmod.json");

const clinicPath = path.join("database", "clinic.json");
const clinic = JSON.parse(readFileSync(path.join(ROOT, clinicPath), "utf-8"));
const treatmentSlugs = clinic.treatments.map((t) => t.slug);

const SOURCES = {
  "": ["app/[locale]/page.tsx", clinicPath],
  "/about": ["app/[locale]/about/page.tsx", clinicPath],
  "/treatments": ["app/[locale]/treatments/page.tsx", clinicPath],
  "/prices": ["app/[locale]/prices/page.tsx", clinicPath],
  "/reservation": ["app/[locale]/reservation/page.tsx"],
  "/blog": ["app/[locale]/blog/page.tsx"],
};
for (const slug of treatmentSlugs) {
  SOURCES[`/treatments/${slug}`] = ["app/[locale]/treatments/[slug]/page.tsx", clinicPath];
}

function lastCommitDate(relPath) {
  try {
    const out = execSync(`git log -1 --format=%cI -- "${relPath}"`, {
      cwd: ROOT,
      encoding: "utf-8",
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

let existing = {};
if (existsSync(OUT)) {
  try {
    existing = JSON.parse(readFileSync(OUT, "utf-8"));
  } catch {
    existing = {};
  }
}

const manifest = { ...existing };
let updated = 0;
for (const [urlPath, files] of Object.entries(SOURCES)) {
  const dates = files.map(lastCommitDate).filter(Boolean);
  if (dates.length === 0) continue; // git 조회 실패 — 기존 값 유지
  const latest = dates.sort().at(-1);
  if (manifest[urlPath] !== latest) updated++;
  manifest[urlPath] = latest;
}

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(manifest, null, 2) + "\n", "utf-8");
console.log(`[gen-sitemap-lastmod] ${Object.keys(manifest).length}개 URL, ${updated}개 갱신 → ${path.relative(ROOT, OUT)}`);
