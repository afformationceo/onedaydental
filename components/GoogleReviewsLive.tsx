import { getTranslations } from "next-intl/server";
import type { GooglePlaceReview } from "@/lib/googleReviews";
import { Star } from "lucide-react";

/**
 * 전역 하단(푸터 위) 블록 — 구글맵 실제 리뷰 라이브 연동. 데이터는 부모
 * (GlobalSocialProofBlock)가 fetch해서 내려준다 — Google Places API 정책상
 * place당 최대 5개의 "가장 관련도 높은" 리뷰만 받을 수 있고, 24시간 캐시로
 * 트래픽과 무관하게 비용을 제어한다(lib/googleReviews.ts).
 */
export default async function GoogleReviewsLive({
  shown,
}: {
  shown: (GooglePlaceReview & { mapsUrl: string })[];
}) {
  const t = await getTranslations("socialProofFooter");

  return (
    <div>
      <div className="flex items-center justify-center gap-2">
        <p className="text-center text-[13px] font-bold text-ink-800">
          {t("googleReviewsTitle")}
        </p>
      </div>
      <div className="mt-4 flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:justify-center lg:px-0 [&::-webkit-scrollbar]:hidden">
        {shown.map((r, i) => (
          <a
            key={i}
            href={r.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-[260px] shrink-0 flex-col rounded-2xl border border-ink-100 bg-surface p-4 shadow-sm shadow-ink-900/5 transition hover:shadow-md"
          >
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className="size-3.5"
                  style={
                    idx < r.rating
                      ? { fill: "#f59e0b", color: "#f59e0b" }
                      : { fill: "none", color: "#d4d4d8" }
                  }
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <p className="mt-2 line-clamp-4 text-[12.5px] leading-relaxed text-ink-600">
              {r.text}
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-ink-400">
              <span className="font-semibold text-ink-700">{r.authorName}</span>
              <span>{r.relativeTime}</span>
            </div>
          </a>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-ink-400">
        {t("googleAttribution")}
      </p>
    </div>
  );
}
