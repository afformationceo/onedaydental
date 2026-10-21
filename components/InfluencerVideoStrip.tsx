import { getLocale, getTranslations } from "next-intl/server";
import { tx } from "@/lib/i18n-text";
import type { Locale, Review } from "@/lib/types";
import InstagramEmbed from "./InstagramEmbed";
import YoutubeEmbed from "./YoutubeEmbed";

/** 전역 하단(푸터 위) 블록 — 인플루언서 영상 임베딩. 데이터는 부모(GlobalSocialProofBlock)가 가져와 내려준다. */
export default async function InfluencerVideoStrip({ items }: { items: Review[] }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("socialProofFooter");

  return (
    <div>
      <p className="px-5 text-center text-[13px] font-bold text-ink-800 lg:px-0">
        {t("influencerTitle")}
      </p>
      <div className="mt-4 flex gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:justify-center lg:px-0 [&::-webkit-scrollbar]:hidden">
        {items.map((r) => (
          <figure key={r.id} className="shrink-0">
            {r.platform === "instagram" ? (
              <InstagramEmbed url={r.url} />
            ) : (
              <YoutubeEmbed url={r.url} />
            )}
            {r.caption && (
              <figcaption className="mt-2 max-w-[244px] text-center text-[11.5px] text-ink-400">
                {tx(r.caption, locale)}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
