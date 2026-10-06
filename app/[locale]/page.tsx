import { setRequestLocale, getTranslations } from "next-intl/server";
import { getClinic } from "@/lib/clinic";
import type { Locale } from "@/lib/types";
import { ArrowRight } from "lucide-react";
import ButtonLink from "@/components/ButtonLink";
import Hero from "@/components/sections/Hero";
import TrustBar from "@/components/sections/TrustBar";
import PromoCarousel from "@/components/sections/PromoCarousel";
import UspSection from "@/components/sections/UspSection";
import TreatmentStory from "@/components/sections/TreatmentStory";
import DoctorAuthority from "@/components/sections/DoctorAuthority";
import CelebrityStrip from "@/components/sections/CelebrityStrip";
import HomeFaq from "@/components/sections/HomeFaq";
import CategoryChips from "@/components/CategoryChips";
import TreatmentExplorer from "@/components/TreatmentExplorer";
import { tx } from "@/lib/i18n-text";
import PriceTable from "@/components/PriceTable";
import StarMarquee from "@/components/sections/StarMarquee";
import LineConsult from "@/components/LineConsult";
import LocationMap from "@/components/LocationMap";
import FinalCta from "@/components/sections/FinalCta";
import ChannelHub from "@/components/blog/ChannelHub";
import { SectionHeader } from "@/components/sections/Section";
import ScrollDepth from "@/components/ScrollDepth";
import ViewTracker from "@/components/ViewTracker";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as Locale;
  const t = await getTranslations();
  const clinic = getClinic();
  const dur = t("common.duration");
  const rec = t("common.recovery");

  return (
    <>
      {/* 1. Hero — 韓星同款 牙齒美學(陶瓷貼片・牙齒美白) + 단일 LINE CTA */}
      <Hero />

      {/* scroll_50 자동 발화 (브리프 §7 — 0초 이탈 대비 관여 측정) */}
      <ScrollDepth />

      {/* 2. Trust badge strip (放心 anchor) */}
      <TrustBar />

      {/* 3. 스토리텔링 — 왜 라미네이트・올세라믹・임플란트・치아미백을 원데이에서 받아야 하는지 */}
      <TreatmentStory />

      {/* 4. Why ONEDAY — 병원 전체 장점・혜택(당일동선·중문통역·투명가) */}
      <UspSection />

      {/* 4.5 "이게 당신이 찾던 시술" — 미백/라미 비주얼 캐러셀 (브리프 §4-2, 광고 정렬) */}
      <PromoCarousel />

      {/* 5. Category quick-nav */}
      <section className="pt-8">
        <CategoryChips />
      </section>

      {/* 6. Pricing — 미백·라미 전면(美學 그룹 최상단). 저관여 결심엔 투명가가 핵심 후킹. */}
      <ViewTracker event="price_view">
        <section id="prices" className="bg-surface-soft py-14 lg:py-20">
          <div className="mx-auto max-w-screen-2xl lg:px-6">
            <SectionHeader
              kicker={t("prices.kicker")}
              title={t("prices.title")}
              subtitle={t("prices.subtitle")}
            />
          </div>
          <div className="mt-8">
            <PriceTable />
          </div>
        </section>
      </ViewTracker>

      {/* 7. Treatments — category TABS (desktop) / ACCORDION (mobile) */}
      <section className="py-14 lg:py-20">
        <SectionHeader
          kicker={t("categories.kicker")}
          title={t("categories.title")}
          subtitle={t("categories.subtitle")}
        />
        <div className="mt-9">
          <TreatmentExplorer
            categories={clinic.categories.map((c) => ({
              id: c.id,
              name: tx(c.name, locale),
              icon: c.icon,
              items: clinic.treatments
                .filter((tr) => tr.category === c.id)
                .map((tr) => ({
                  slug: tr.slug,
                  name: tx(tr.name, locale),
                  tagline: tx(tr.tagline, locale),
                  duration: tx(tr.duration, locale),
                  recovery: tx(tr.recovery, locale),
                  highlights: tr.highlights.map((h) => tx(h, locale)),
                })),
            }))}
            labels={{ duration: dur, recovery: rec, detail: t("categories.viewDetail") }}
          />
        </div>
        <div className="mx-auto mt-8 max-w-md px-5">
          <ButtonLink href="/treatments" className="w-full">
            {t("categories.viewAll")}
            <ArrowRight className="size-4" />
          </ButtonLink>
        </div>
      </section>

      {/* 8. Reviews — Google 실제 리뷰 + 연예인 동행 + 별점 마퀴를 한 블록으로 통합 */}
      <section id="reviews" className="scroll-mt-20 bg-surface-soft py-14 lg:py-20">
        <div className="mx-auto max-w-screen-2xl lg:px-6">
          <SectionHeader
            kicker={t("reviews.kicker")}
            title={t("reviews.title")}
            subtitle={t("reviews.subtitle")}
          />
        </div>
        <div className="mt-8">
          <CelebrityStrip />
          <StarMarquee />
        </div>
      </section>

      {/* 9. Chief-doctor authority — 후기 다음, 신뢰 보강 */}
      <DoctorAuthority />

      {/* 10. FAQ (의료관광 반론 — 당일·통역·동일가·체류일) */}
      <HomeFaq />

      {/* 11. 오시는 길 — 구글맵 + 인천공항에서 찾아오는 길 */}
      <section className="py-14 lg:py-20">
        <LocationMap />
      </section>

      {/* 12. LINE 상담 (단일 회수 경로) */}
      <section id="reservation" className="bg-surface-soft py-14 lg:py-20">
        <div className="mx-auto max-w-screen-2xl lg:px-6">
          <SectionHeader
            kicker={t("reservation.kicker")}
            title={t("reservation.title")}
            subtitle={t("reservation.subtitle")}
          />
        </div>
        <div className="mt-8">
          <LineConsult placement="home_reservation" />
        </div>
      </section>

      {/* 12.5 전 채널 백링크 모음 (라인·구글맵 1~3관 상호강화 — 사이트/Littly 제거, 인스타는 우측상단 플로팅으로 분리) */}
      <section className="py-14 lg:py-20">
        <div className="mx-auto max-w-screen-2xl px-5 lg:px-6">
          <ChannelHub
            title={locale === "ko" ? "원데이치과와 연결" : "與 韓國oneday牙科 連結"}
            subtitle={
              locale === "ko"
                ? "LINE 예약・1~3관 지도 안내를 한 번에"
                : "LINE 預約・1～3館地圖導航，一次擁有"
            }
          />
        </div>
      </section>

      {/* 13. Final LINE CTA (cta_view 노출 추적) */}
      <ViewTracker event="cta_view">
        <FinalCta />
      </ViewTracker>
    </>
  );
}
