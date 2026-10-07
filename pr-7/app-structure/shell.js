/*
 * 앱 셸 — 모든 기능 프로토타입 위에 같은 내비게이션을 그린다.
 * 이 파일(특히 APPS)을 바꾸는 PR 은 미리보기에서 **모든 화면의 구조**가 바뀐다. 구조 개편은 여기서 한다.
 *
 * 쓰는 법 (기능 프로토타입의 <head>, theme.js 다음):
 *   <script src="../app-structure/shell.js" data-active="book-club" defer></script>
 *   data-active = 지금 화면의 slug (prototypes/<slug>/)
 *
 * 브랜드마다 앱이 다르다 — 책숲(독자)과 책숲 파트너(사장님)는 메뉴부터 다르다.
 * 지금 브랜드는 <html data-brand> 를 읽고, 보기 전환 바에서 브랜드를 바꾸면(ds:change) 다시 그린다.
 * 그리는 것: 데스크톱(≥1024px) 상단 바 / 모바일 하단 탭 바. body 에 has-shell 을 붙여 화면이 셸만큼 비켜 서게 한다.
 * ⚠️ 셸은 제품 화면이다. 리뷰 도구인 보기 전환 바(#view)와 섞지 않는다 — #view 는 셸 위에 남는다.
 */
(() => {
  // 확정된 정보 구조. 순서 = 탭 순서. slugs 의 첫 번째가 그 탭을 눌렀을 때 가는 화면이다.
  const APPS = {
    reader: {
      name: "책숲",
      nav: [
        { id: "home", label: "홈", icon: "⌂", href: "../" },
        { id: "club", label: "모임", icon: "☕", slugs: ["book-club"] },
        { id: "challenge", label: "챌린지", icon: "✓", slugs: ["reading-challenge"] },
        { id: "me", label: "내 서재", icon: "♡", href: "#" },
      ],
    },
    partner: {
      name: "책숲 파트너",
      nav: [
        { id: "dashboard", label: "대시보드", icon: "▦", href: "../" },
        { id: "club", label: "모임 운영", icon: "☕", slugs: ["book-club"] },
        { id: "store", label: "내 서점", icon: "▤", href: "#" },
      ],
    },
  };

  const active = document.currentScript?.dataset.active ?? "";
  const hrefOf = (n) => n.href ?? `../${n.slugs[0]}/`;
  const current = (n) => (n.slugs?.includes(active) ? ' aria-current="page"' : "");

  const css = `
    body.has-shell { padding-bottom: var(--ds-shell-bottom); }
    .app-shell { position: sticky; top: 0; z-index: 40; display: flex; align-items: center; gap: var(--ds-space-4);
      height: var(--ds-shell-top); padding: 0 var(--ds-space-4); background: var(--ds-color-surface); border-bottom: 1px solid var(--ds-color-line); }
    .app-shell__logo { font-weight: 800; letter-spacing: var(--ds-tracking-display); color: var(--ds-color-brand-text); }
    .app-shell__nav { display: none; gap: var(--ds-space-1); }
    .app-shell__nav a, .app-tabbar a { color: var(--ds-color-sub); text-decoration: none; }
    .app-shell__nav a { padding: var(--ds-space-2) var(--ds-space-3); border-radius: var(--ds-radius-pill); }
    .app-shell__nav a[aria-current="page"], .app-tabbar a[aria-current="page"] { color: var(--ds-color-brand-text); font-weight: 700; }
    .app-shell__nav a[aria-current="page"] { background: var(--ds-color-brand-soft); }
    .app-tabbar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; display: flex; height: var(--ds-shell-bottom);
      background: var(--ds-color-surface); border-top: 1px solid var(--ds-color-line); }
    .app-tabbar a { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 11px; }
    .app-tabbar span { font-size: 18px; }
    @media (min-width: 1024px) {
      body.has-shell { padding-bottom: 0; }
      .app-shell__nav { display: flex; }
      .app-tabbar { display: none; }
    }`;

  const header = document.createElement("header");
  header.className = "app-shell";
  const tabbar = document.createElement("nav");
  tabbar.className = "app-tabbar";
  tabbar.setAttribute("aria-label", "주 메뉴");

  const render = () => {
    const app = APPS[document.documentElement.dataset.brand] ?? APPS.reader;
    header.innerHTML = `<span class="app-shell__logo">${app.name}</span>
      <nav class="app-shell__nav" aria-label="주 메뉴">${app.nav.map((n) => `<a href="${hrefOf(n)}"${current(n)}>${n.label}</a>`).join("")}</nav>`;
    tabbar.innerHTML = app.nav
      .map((n) => `<a href="${hrefOf(n)}"${current(n)}><span aria-hidden="true">${n.icon}</span>${n.label}</a>`)
      .join("");
  };

  const mount = () => {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.append(style);
    render();
    const view = document.getElementById("view");
    view ? view.after(header) : document.body.prepend(header);
    document.body.append(tabbar);
    document.body.classList.add("has-shell");
  };

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", mount) : mount();
  document.addEventListener("ds:change", render);

  // app-structure/index.html(사이트맵)이 같은 APPS 를 읽어 그린다 — 구조를 두 벌로 적지 않는다.
  window.APP_STRUCTURE = { APPS };
})();
