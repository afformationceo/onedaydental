import { getTranslations } from "next-intl/server";
import { getClinic } from "@/lib/clinic";
import { Star } from "lucide-react";
import Reveal from "../Reveal";

/**
 * 실제 구글 리뷰 가로 슬라이드 — database/clinic.json의 googleReviews(실제
 * 리뷰 스크린샷을 그대로 옮긴 정적 데이터)를 모바일에서도 스와이프로 넘겨볼
 * 수 있는 카드 스트립으로 보여준다. CelebrityStrip·StarMarquee(스타 동행)
 * 바로 아래, "실제 환자 후기" 자리를 채운다.
 */
export default async function GoogleReviewsSlider() {
  const t = await getTranslations("reviews");
  const { googleReviews } = getClinic();
  if (!googleReviews?.length) return null;

  return (
    <Reveal className="mt-8">
      <p className="mb-3 px-5 text-center text-[12.5px] font-semibold text-ink-400 lg:px-0">
        {t("googleNote")}
      </p>
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:justify-center lg:px-0 [&::-webkit-scrollbar]:hidden">
        {googleReviews.map((r) => (
          <div
            key={r.id}
            className="flex w-[82vw] max-w-[280px] shrink-0 snap-start flex-col rounded-2xl border border-ink-100 bg-surface p-4 shadow-sm shadow-ink-900/5"
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
            <p className="mt-2 line-clamp-5 text-[12.5px] leading-relaxed text-ink-600">
              {r.text}
            </p>
            <div className="mt-3 flex items-center justify-between text-[11px] text-ink-400">
              <span className="font-semibold text-ink-700">{r.authorName}</span>
              <span>{r.relativeTime}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-ink-400">{t("googleAttribution")}</p>
    </Reveal>
  );
}
