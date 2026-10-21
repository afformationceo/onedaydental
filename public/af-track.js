/* af-track v1 — 어포메이션 표준 행동 이벤트 (2026-10-21). 원본: afformation-gsc-report/ops/track/af-track.js — 병원 저장소에서 직접 고치지 말 것.
   GA4 기본 항목(percent_scrolled·link_*·method·content_id·content_type·value)에만 실어 보낸다 → 맞춤 측정기준 등록 없이 Data API(읽기)로 조회.
   af_scroll     percent_scrolled 25·50·75·100                         어디까지 보나
   af_msg_click  method(채널) · link_classes(버튼 위치) · link_url · link_text · content_id(그때 소제목)   무엇을 누르나
   af_faq_open   link_text(질문) · content_id · content_type(faq | toggle=FAQ 밖 펼침)
   af_price_view content_type=price · content_id                        가격표가 화면에 보였나(페이지당 1회)
   af_exit       percent_scrolled(최대) · content_id(마지막 소제목) · value(머문 초) · link_text(요약 f·p·m)   어디서 나가나
                 같은 사이트 안 링크로 이동한 경우는 보내지 않는다(그건 이탈이 아님) */
(function () {
  if (window.__afTrack) return; window.__afTrack = 1;
  var w = window, d = document;

  function send(name, p) {
    try {
      if (typeof w.gtag === "function") w.gtag("event", name, p);
      else { w.dataLayer = w.dataLayer || []; (function () { w.dataLayer.push(arguments); })("event", name, p); }   // gtag.js 가 늦게 뜨는 사이트(대기열로 넘김)
    } catch (e) {}
  }
  function cut(s, n) { return String(s || "").replace(/\s+/g, " ").trim().slice(0, n || 100); }

  var CH = [["line", /(^|\.)(line\.me|lin\.ee)$/], ["whatsapp", /(^|\.)(wa\.me|whatsapp\.com)$/], ["kakao", /(^|\.)kakao\.com$/],
            ["messenger", /(^|\.)(m\.me|messenger\.com)$/], ["instagram", /(^|\.)(ig\.me|instagram\.com)$/], ["telegram", /(^|\.)t\.me$/],
            ["zalo", /(^|\.)zalo\.me$/], ["wechat", /(^|\.)(weixin\.qq\.com|wechat\.com)$/]];

  var S;
  function reset() {
    S = { path: location.pathname, max: 0, marks: {}, sec: "", faq: {}, nfaq: 0, price: 0, nmsg: 0, vis: 0, since: d.visibilityState === "visible" ? Date.now() : 0, gone: 0, nav: 0 };
  }
  reset();

  function secOf(el) {   // 요소가 속한 소제목(앞쪽 마지막 h2) — 지금 읽는 위치(S.sec)와 다를 수 있다
    var hs = d.querySelectorAll("h2"), s = "";
    for (var i = 0; i < hs.length; i++) { if (hs[i].compareDocumentPosition(el) & 4) s = hs[i].textContent; else break; }
    return cut(s, 80);
  }
  function engaged() { return Math.min(1800, Math.round((S.vis + (S.since ? Date.now() - S.since : 0)) / 1000)); }
  function pct() {
    var h = Math.max(d.documentElement.scrollHeight, d.body ? d.body.scrollHeight : 0);
    return h > 0 ? Math.min(100, Math.round(((w.scrollY || w.pageYOffset) + w.innerHeight) / h * 100)) : 0;
  }

  // 어디까지 보나 — 스크롤했을 때만 센다(짧은 페이지가 열자마자 100%로 잡히지 않게)
  var tick = 0;
  w.addEventListener("scroll", function () {
    if (tick) return; tick = 1;
    setTimeout(function () {
      tick = 0; var p = pct(); if (p > S.max) S.max = p;
      [25, 50, 75, 100].forEach(function (m) {
        if (p >= m && !S.marks[m]) { S.marks[m] = 1; send("af_scroll", { percent_scrolled: m }); }
      });
    }, 250);
  }, { passive: true });

  // 지금 읽는 소제목 — 화면 위쪽 60% 안에 들어온 마지막 h2
  var io = "IntersectionObserver" in w ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) S.sec = cut(e.target.textContent, 80); });
  }, { rootMargin: "0px 0px -40% 0px" }) : null;
  var po = "IntersectionObserver" in w ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (e.isIntersecting && !S.price) { S.price = 1; send("af_price_view", { content_type: "price", content_id: secOf(e.target) }); }
    });
  }, { threshold: 0.4 }) : null;
  var PRICE = /(^|[\s_-])(price|prices|pricing|cost|costs|fee|fees|tariff)([\s_-]|$)/i, CUR = /(₩|원|\$|USD|円|NT\$|元|฿|đ|VND|Rp|RM|₱)\s?\d|\d[\d,.]*\s?(원|円|元|USD|VND)/;
  function scan() {
    if (!io) return;
    io.disconnect(); po.disconnect();
    var hs = d.querySelectorAll("h2"); for (var i = 0; i < hs.length; i++) io.observe(hs[i]);
    var c = d.querySelectorAll("[id],[class],table");
    for (var j = 0, n = 0; j < c.length && n < 40; j++) {
      var el = c[j], k = (el.id || "") + " " + (typeof el.className === "string" ? el.className : "");
      if ((PRICE.test(k) || (el.tagName === "TABLE" && CUR.test(cut(el.textContent, 2000)))) && el.offsetHeight > 40) { po.observe(el); n++; }
    }
  }

  function where(a) {
    if (a.closest("header,nav")) return "header";
    if (a.closest("footer")) return "footer";
    for (var e = a, i = 0; e && e !== d.body && i < 8; e = e.parentElement, i++) {
      var ps = getComputedStyle(e).position; if (ps === "fixed" || ps === "sticky") return "float";
    }
    var r = a.getBoundingClientRect(); return r.top + (w.scrollY || w.pageYOffset) < w.innerHeight ? "hero" : "body";
  }

  // 무엇을 누르나 — 메신저·전화·메일 / 같은 사이트 안 이동은 이탈 아님 표시
  d.addEventListener("click", function (ev) {
    try {
      var a = ev.target && ev.target.closest && ev.target.closest("a[href]"); if (!a) return;
      var u = new URL(a.href, location.href), ch = "";
      if (u.protocol === "tel:") ch = "phone"; else if (u.protocol === "mailto:") ch = "email";
      else for (var i = 0; i < CH.length; i++) if (CH[i][1].test(u.hostname)) { ch = CH[i][0]; break; }
      if (ch) {
        S.nmsg++; var pos = where(a);
        send("af_msg_click", { method: ch, link_classes: pos, link_url: cut(u.href, 100), link_domain: u.hostname, link_text: cut(a.textContent || a.getAttribute("aria-label"), 100), content_id: pos === "body" || pos === "hero" ? secOf(a) : S.sec });   // 떠 있는·머리말·꼬리말 버튼은 그때 읽던 소제목
      } else if (u.hostname.replace(/^www\./, "") === location.hostname.replace(/^www\./, "") && a.target !== "_blank" && !ev.metaKey && !ev.ctrlKey && !ev.shiftKey) {
        S.nav = Date.now();
      }
    } catch (e) {}
  }, true);
  d.addEventListener("submit", function () { S.nav = Date.now(); }, true);

  // FAQ 펼침 — <details> 와 aria-expanded 아코디언
  var FAQ = /faq|q&a|qna|question|자주|질문|よくある|質問|常見|问题|問題|câu hỏi|pertanyaan|คำถาม/i;
  function faq(el) {
    var q = cut((el.querySelector && el.querySelector("summary") || el).textContent, 100);
    if (!q || S.faq[q]) return; S.faq[q] = 1;
    var sec = secOf(el), isfaq = FAQ.test(sec);   // FAQ 영역 밖 펼침(증례 더보기 등)은 content_type=toggle 로 구분(티아나 10-21 실측)
    for (var e = el, i = 0; !isfaq && e && e !== d.body && i < 6; e = e.parentElement, i++) isfaq = FAQ.test((e.id || "") + " " + (typeof e.className === "string" ? e.className : ""));
    if (isfaq) S.nfaq++;
    send("af_faq_open", { link_text: q, content_id: sec, content_type: isfaq ? "faq" : "toggle" });
  }
  d.addEventListener("toggle", function (ev) { var t = ev.target; if (t && t.tagName === "DETAILS" && t.open) faq(t); }, true);
  d.addEventListener("click", function (ev) {
    var b = ev.target && ev.target.closest && ev.target.closest("[aria-expanded]"); if (!b || b.closest("header,nav")) return;
    setTimeout(function () { if (b.getAttribute("aria-expanded") === "true") faq(b); }, 0);
  }, true);

  // 어디서 나가나 — 탭이 가려지거나 페이지가 닫힐 때 1회
  function exit() {
    if (S.gone || Date.now() - S.nav < 4000) return; S.gone = 1;
    send("af_exit", { percent_scrolled: Math.max(S.max, pct()) >= 100 ? 100 : Math.floor(Math.max(S.max, pct()) / 25) * 25, content_id: S.sec, value: engaged(),
                      link_text: "f" + S.nfaq + "|p" + S.price + "|m" + S.nmsg, transport_type: "beacon" });
  }
  d.addEventListener("visibilitychange", function () {
    if (d.visibilityState === "hidden") { if (S.since) { S.vis += Date.now() - S.since; S.since = 0; } exit(); }
    else S.since = Date.now();
  });
  w.addEventListener("pagehide", exit);

  // Next.js 등 화면 전환(주소만 바뀜) — 페이지 단위 상태를 새로 시작한다(이탈 아님)
  function route() { if (location.pathname !== S.path) { reset(); setTimeout(scan, 1200); } }
  ["pushState", "replaceState"].forEach(function (m) {
    var o = history[m]; history[m] = function () { var r = o.apply(this, arguments); try { route(); } catch (e) {} return r; };
  });
  w.addEventListener("popstate", route);

  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", function () { setTimeout(scan, 800); }); else setTimeout(scan, 800);
  w.addEventListener("load", function () { setTimeout(scan, 1500); });
})();
