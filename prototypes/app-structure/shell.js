/*
 * 앱 셸 — 모든 기능 프로토타입 위에 같은 내비게이션을 그린다.
 * 이 파일(특히 NAV)을 바꾸는 PR 은 미리보기에서 **모든 화면의 구조**가 바뀐다. 구조 개편은 여기서 한다.
 *
 * 쓰는 법 (기능 프로토타입의 <head>):
 *   <script src="../app-structure/shell.js" data-active="fan-chat" defer></script>
 *   data-active = 지금 화면이 속한 NAV 항목의 id (또는 그 항목 children 의 slug)
 *
 * 그리는 것: 데스크톱(≥1024px) 상단 바 / 모바일 하단 탭 바. body 에 class="has-shell" 을 붙여
 * 기능 화면이 셸 높이만큼 비켜 서게 한다(--ds-shell-top / --ds-shell-bottom).
 * ⚠️ 셸은 제품 화면이다. 리뷰 도구인 보기 전환 바(#view)와 섞지 않는다 — #view 는 셸 위에 남는다.
 */
(() => {
  const PRODUCT = "팬온";

  // 확정된 정보 구조. 순서 = 탭 순서. children 의 slug 는 prototypes/<slug>/ 와 같다.
  const NAV = [
    { id: "home", label: "홈", icon: "⌂", href: "../" },
    { id: "community", label: "소통", icon: "✉", children: ["fan-chat", "fan-letter"] },
    { id: "events", label: "참여", icon: "★", children: ["stream-vote", "highlight-vote", "birthday-support"] },
    { id: "me", label: "내 정보", icon: "☺", href: "#" },
  ];

  const me = document.currentScript;
  const active = me?.dataset.active ?? "";
  const hrefOf = (n) => n.href ?? `../${n.children[0]}/`;
  const isActive = (n) => n.id === active || n.children?.includes(active);

  const css = `
    body.has-shell { padding-bottom: var(--ds-shell-bottom); }
    .app-shell { position: sticky; top: 0; z-index: 40; display: flex; align-items: center; gap: var(--ds-space-4);
      height: var(--ds-shell-top); padding: 0 var(--ds-space-4); background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-line); }
    .app-shell__logo { font-weight: 800; letter-spacing: -0.03em; }
    .app-shell__nav { display: none; gap: var(--ds-space-1); }
    .app-shell__nav a, .app-tabbar a { color: var(--ds-color-sub); text-decoration: none; }
    .app-shell__nav a { padding: var(--ds-space-2) var(--ds-space-3); border-radius: var(--ds-radius-sm); }
    .app-shell__nav a[aria-current="page"], .app-tabbar a[aria-current="page"] { color: var(--ds-color-text); }
    .app-shell__nav a[aria-current="page"] { background: var(--ds-color-surface-2); }
    .app-sub { display: flex; gap: var(--ds-space-2); padding: var(--ds-space-2) var(--ds-space-4); overflow-x: auto; border-bottom: 1px solid var(--ds-color-line); }
    .app-sub a { flex: none; padding: 4px var(--ds-space-3); border-radius: var(--ds-radius-pill); background: var(--ds-color-surface-2); color: var(--ds-color-sub); text-decoration: none; font-size: var(--ds-font-size-sm); }
    .app-sub a[aria-current="page"] { background: var(--ds-color-brand-soft); color: var(--ds-color-brand-text); }
    .app-tabbar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; display: flex; height: var(--ds-shell-bottom);
      background: var(--ds-color-surface); border-top: 1px solid var(--ds-color-line); }
    .app-tabbar a { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 11px; }
    .app-tabbar span { font-size: 18px; }
    @media (min-width: 1024px) {
      body.has-shell { padding-bottom: 0; }
      .app-shell__nav { display: flex; }
      .app-tabbar { display: none; }
    }`;

  // 하위 기능 이름 — 셸이 프로토타입 제목을 몰라도 되게 여기서만 쓴다.
  const LABEL = { "fan-chat": "팬 챗", "fan-letter": "팬레터", "stream-vote": "다음 방송 투표", "highlight-vote": "하이라이트", "birthday-support": "생일 서포트" };

  const mount = () => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.append(style);

    const link = (n) => `<a href="${hrefOf(n)}"${isActive(n) ? ' aria-current="page"' : ""}>${n.label}</a>`;
    const group = NAV.find(isActive);
    const sub = group?.children
      ? `<nav class="app-sub" aria-label="${group.label}">${group.children
          .map((s) => `<a href="../${s}/"${s === active ? ' aria-current="page"' : ""}>${LABEL[s] ?? s}</a>`)
          .join("")}</nav>`
      : "";

    const header = document.createElement("div");
    header.innerHTML = `
      <header class="app-shell"><span class="app-shell__logo">${PRODUCT}</span><nav class="app-shell__nav" aria-label="주 메뉴">${NAV.map(link).join("")}</nav></header>
      ${sub}`;
    const view = document.getElementById("view");
    view ? view.after(...header.children) : document.body.prepend(...header.children);

    const tabbar = document.createElement("nav");
    tabbar.className = "app-tabbar";
    tabbar.setAttribute("aria-label", "주 메뉴");
    tabbar.innerHTML = NAV.map((n) => `<a href="${hrefOf(n)}"${isActive(n) ? ' aria-current="page"' : ""}><span aria-hidden="true">${n.icon}</span>${n.label}</a>`).join("");
    document.body.append(tabbar);
    document.body.classList.add("has-shell");
  };

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", mount) : mount();

  // app-structure/index.html(사이트맵)이 같은 NAV 를 읽어 그린다 — 구조를 두 벌로 적지 않는다.
  window.APP_NAV = { PRODUCT, NAV, LABEL };
})();
