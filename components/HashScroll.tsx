"use client";

import { useEffect } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * 브라우저 기본 해시 스크롤(#reviews 등)이 믿을 수 없는 이유:
 * Hero/GoogleReviews류 클라이언트 컴포넌트가 하이드레이션 이후 비동기로
 * 마운트되고, 이미지 로딩으로 레이아웃이 계속 바뀌면서 최초 스크롤 위치가
 * 틀어진다. 그래서 로드 후 직접 스크롤하고, 레이아웃이 안정될 때까지
 * 짧게 재시도한다.
 */
export default function HashScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;
    const id = hash.slice(1);

    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      attempts += 1;
      // 이미지/폰트 로딩으로 레이아웃이 늦게 확정되는 경우를 대비해 몇 번 더 보정한다.
      if (attempts < 4) {
        setTimeout(tryScroll, 350);
      }
    };

    // 레이아웃이 아직 안 잡힌 첫 프레임을 피하려고 한 틱 늦춘다.
    const t = setTimeout(tryScroll, 60);
    return () => clearTimeout(t);
    // pathname 변화(페이지 이동) 시에도 새 해시를 다시 체크한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
