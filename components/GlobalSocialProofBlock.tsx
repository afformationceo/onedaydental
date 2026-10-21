import { getClinic } from "@/lib/clinic";
import { getAllGooglePlaceReviews } from "@/lib/googleReviews";
import InfluencerVideoStrip from "./InfluencerVideoStrip";
import GoogleReviewsLive from "./GoogleReviewsLive";

const MAX_GOOGLE_REVIEWS = 9;

/**
 * 모든 페이지 공통 하단(Footer 바로 위) 블록 — 인플루언서 영상 임베딩 +
 * 구글맵 실제 리뷰 라이브 연동을 한 묶음으로 배치한다. AppShell에 걸려 있어
 * 새 페이지가 추가돼도 자동으로 노출된다. 데이터(reviews[].embed 항목,
 * branches[].placeId + GOOGLE_PLACES_API_KEY)가 둘 다 비어 있으면 이 블록
 * 자체가 아무것도 렌더링하지 않는다 — 콘텐츠가 채워지기 전까지 자동 숨김.
 */
export default async function GlobalSocialProofBlock() {
  const { reviews, branches } = getClinic();
  const influencerItems = reviews.filter(
    (r) => r.embed && (r.platform === "instagram" || r.platform === "youtube"),
  );
  const googleResults = await getAllGooglePlaceReviews(branches);
  const googleShown = googleResults
    .flatMap((r) => r.reviews.map((rev) => ({ ...rev, mapsUrl: r.mapsUrl })))
    .slice(0, MAX_GOOGLE_REVIEWS);

  if (!influencerItems.length && !googleShown.length) return null;

  return (
    <section className="border-t border-ink-100 bg-surface-soft py-10">
      <div className="mx-auto max-w-screen-2xl space-y-10 lg:px-6">
        {influencerItems.length > 0 && <InfluencerVideoStrip items={influencerItems} />}
        {googleShown.length > 0 && <GoogleReviewsLive shown={googleShown} />}
      </div>
    </section>
  );
}
