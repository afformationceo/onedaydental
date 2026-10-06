import Image from "next/image";
import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getClinic } from "@/lib/clinic";
import { tx } from "@/lib/i18n-text";
import type { Locale } from "@/lib/types";

/**
 * 치료 카테고리 가로 스크롤 칩 — 추상 아이콘 대신 실제 사진 썸네일을 쓴다
 * (아이콘이 너무 "AI 스톡"처럼 보인다는 피드백 반영 + 실제 병원 사진으로 신뢰도↑).
 * href도 /treatments 로 고쳤다 — 기존엔 #cat-* 앵커가 홈화면 자신에게 걸려있어서
 * /treatments 페이지에만 있는 해당 id로 못 가는 죽은 링크였다.
 */
export default async function CategoryChips() {
  const locale = (await getLocale()) as Locale;
  const clinic = getClinic();
  const categories = clinic.categories.filter((c) =>
    clinic.treatments.some((tr) => tr.category === c.id),
  );

  return (
    <div className="no-scrollbar mx-auto flex max-w-screen-2xl gap-2.5 overflow-x-auto px-5 pb-1 lg:px-10">
      {categories.map((c) => {
        const first = clinic.treatments.find((tr) => tr.category === c.id);
        return (
          <Link
            key={c.id}
            href={`/treatments#cat-${c.id}`}
            className="group flex shrink-0 items-center gap-2.5 rounded-full border border-ink-100 bg-surface py-1.5 pl-1.5 pr-4 transition hover:border-mint-400 hover:bg-surface-soft"
          >
            <span className="relative size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-ink-100">
              {first?.image ? (
                <Image
                  src={first.image}
                  alt=""
                  fill
                  sizes="36px"
                  className="object-cover transition group-hover:scale-110"
                />
              ) : (
                <span className="block size-full bg-brand-50" />
              )}
            </span>
            <span className="whitespace-nowrap text-[13px] font-bold text-ink-800">
              {tx(c.name, locale)}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
