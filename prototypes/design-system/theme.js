/*
 * 브랜드·테마 고르기 — <html data-brand data-theme> 를 붙이고, 보기 전환 바(#view)에 고르는 칸을 더한다.
 * 모든 프로토타입이 <head> 에서 가장 먼저 부른다 (그려지기 전에 색이 정해져야 깜빡이지 않는다):
 *
 *   <script src="../design-system/theme.js" data-brands="reader partner"></script>
 *
 * data-brands = 이 화면이 속한 브랜드(첫 번째가 기본값). 명세 머리 「브랜드」 칸과 같아야 한다.
 * 고르는 순서: 주소 ?brand=&theme=  →  지난번 고른 값(localStorage)  →  data-brands 첫 번째 · 라이트.
 * 주소 값이 이기는 이유: 리뷰어에게 "파트너 다크로 봐 주세요" 링크를 그대로 보낼 수 있게.
 */
(() => {
  const BRANDS = { reader: "책숲", partner: "책숲 파트너" };
  const THEMES = { light: "라이트", dark: "다크" };

  const me = document.currentScript;
  const own = (me?.dataset.brands ?? "reader").split(/\s+/).filter((b) => b in BRANDS);
  const q = new URLSearchParams(location.search);
  const saved = (k) => { try { return localStorage.getItem(`ds-${k}`); } catch { return null; } };
  const save = (k, v) => { try { localStorage.setItem(`ds-${k}`, v); } catch { /* 사생활 모드 — 이번 화면만 */ } };
  const pick = (k, table, fallback) => [q.get(k), saved(k), fallback].find((v) => v && v in table);

  const html = document.documentElement;
  html.dataset.brand = pick("brand", BRANDS, own[0] ?? "reader");
  html.dataset.theme = pick("theme", THEMES, "light");

  const options = (table, cur) =>
    Object.entries(table).map(([v, t]) => `<option value="${v}"${v === cur ? " selected" : ""}>${t}</option>`).join("");

  const mount = () => {
    const view = document.getElementById("view");
    if (!view) return;
    const wrap = document.createElement("span");
    wrap.style.display = "contents";
    wrap.innerHTML = `
      <label>브랜드 <select data-ds="brand">${options(BRANDS, html.dataset.brand)}</select></label>
      <label>테마 <select data-ds="theme">${options(THEMES, html.dataset.theme)}</select></label>`;
    const warn = document.createElement("span");
    warn.style.color = "#ffd27a";
    const check = () => {
      const off = !own.includes(html.dataset.brand);
      warn.hidden = !off;
      warn.textContent = off ? `⚠ 이 화면은 ${own.map((b) => BRANDS[b]).join("·")} 화면이다` : "";
    };
    view.append(wrap, warn);
    check();
    wrap.addEventListener("change", (e) => {
      const k = e.target.dataset.ds;
      html.dataset[k] = e.target.value;
      save(k, e.target.value);
      check();
      document.dispatchEvent(new CustomEvent("ds:change", { detail: { ...html.dataset } }));
    });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", mount) : mount();

  window.DS_THEME = { BRANDS, THEMES, own };
})();
