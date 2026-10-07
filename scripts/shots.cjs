// 화면 비교 — main 과 PR 의 모든 프로토타입을 찍어 나란히 놓는다. 디자인 시스템·구조를 바꾼 PR 이
// "어느 화면이 얼마나 바뀌었나"를 링크를 하나씩 열지 않고 한 장에서 보게 하는 도구다.
//
// 사용: node scripts/shots.cjs <main prototypes> <PR prototypes> <출력 폴더>
//   PLAYWRIGHT 환경 변수 = playwright 모듈 경로 (레포에 의존성을 두지 않으려고 워크플로가 따로 설치한다)
//
// 찍는 조합: 화면마다 SPEC.md 「브랜드」 × 라이트·다크 × 360·1280px. 주소의 ?brand=&theme= 로 고른다(theme.js).
// 판정은 PNG 바이트 해시가 같은가뿐이다 — 같은 브라우저·같은 글꼴이라 안 바뀐 화면은 바이트까지 같다.
// ⚠️ 화면에 시각·난수가 그려지면 매번 "달라짐"이 된다. 프로토타입은 가짜 데이터를 고정값으로 쓴다.

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const crypto = require("node:crypto");
const { readSpec } = require("./hub.cjs");

const THEMES = ["light", "dark"];
const WIDTHS = [360, 1280];

function slugsOf(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_") && fs.existsSync(path.join(dir, d.name, "index.html")))
    .map((d) => d.name);
}

function brandsOf(dirs, slug) {
  const spec = dirs.map((d) => path.join(d, slug, "SPEC.md")).find((p) => fs.existsSync(p));
  const brands = spec ? readSpec(fs.readFileSync(spec, "utf8")).brands : [];
  return brands.length ? brands : ["reader"];
}

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".md": "text/markdown; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png" };

function serve(root) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, "http://x").pathname).replace(/\/$/, "/index.html");
    const file = path.join(root, rel);
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404);
      return res.end();
    }
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
    res.end(fs.readFileSync(file));
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

const hash = (file) => (fs.existsSync(file) ? crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex") : null);

async function shoot(browser, port, slug, brand, theme, width, out) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  try {
    await page.goto(`http://127.0.0.1:${port}/${slug}/?brand=${brand}&theme=${theme}`, { waitUntil: "networkidle", timeout: 20000 });
    await page.screenshot({ path: out, fullPage: true });
  } finally {
    await page.close();
  }
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function gallery(rows, summary) {
  const label = { same: "같음", changed: "달라짐", added: "새 화면", removed: "사라진 화면" };
  const body = rows
    .map((r) => `
      <section class="row" data-status="${r.status}">
        <h2>${esc(r.slug)} <span>${esc(r.brand)} · ${esc(r.theme)} · ${r.width}px</span> <b data-status="${r.status}">${label[r.status]}</b></h2>
        ${r.status === "same" ? "<p>변화 없음</p>" : `<div class="pair">
          <figure><figcaption>main</figcaption>${r.base ? `<img loading="lazy" src="${esc(r.base)}" alt="">` : "<p>없음</p>"}</figure>
          <figure><figcaption>이 PR</figcaption>${r.head ? `<img loading="lazy" src="${esc(r.head)}" alt="">` : "<p>없음</p>"}</figure>
        </div>`}
      </section>`)
    .join("");
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>화면 비교</title>
<style>
  body { margin: 0; font-family: system-ui, sans-serif; background: #0b0b10; color: #f4f4f6; }
  header { position: sticky; top: 0; padding: 12px 16px; background: #15151d; border-bottom: 1px solid #262633; display: flex; flex-wrap: wrap; gap: 8px 16px; align-items: center; }
  a { color: #c9b3ff; }
  .row { padding: 16px; border-bottom: 1px solid #262633; }
  h2 { font-size: 15px; margin: 0 0 8px; } h2 span { color: #9a9aab; font-weight: 400; }
  b { font-size: 12px; padding: 2px 8px; border-radius: 6px; background: #2d2d3a; }
  b[data-status="changed"] { background: #5a3c00; } b[data-status="added"] { background: #10422c; } b[data-status="removed"] { background: #4a1620; }
  .pair { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; align-items: start; }
  figure { margin: 0; } figcaption { font-size: 12px; color: #9a9aab; margin-bottom: 4px; }
  img { width: 100%; border: 1px solid #262633; border-radius: 8px; }
  body.only .row[data-status="same"] { display: none; }
</style></head>
<body class="only">
<header>
  <a href="../">← 이 PR 의 목록</a>
  <strong>달라짐 ${summary.changed} · 새 화면 ${summary.added} · 사라짐 ${summary.removed} · 같음 ${summary.same}</strong>
  <label><input type="checkbox" checked onchange="document.body.classList.toggle('only', this.checked)"> 달라진 것만</label>
</header>
${rows.some((r) => r.status !== "same") ? "" : '<p style="padding:16px">main 과 달라진 화면이 없다.</p>'}
${body}
</body></html>`;
}

async function main() {
  const [baseDir, headDir, outDir] = process.argv.slice(2).map((p) => path.resolve(p));
  if (!baseDir || !headDir || !outDir) {
    console.error("Usage: shots.cjs <main prototypes> <PR prototypes> <out dir>");
    process.exit(1);
  }
  const { chromium } = require(process.env.PLAYWRIGHT || "playwright");
  const [baseSrv, headSrv] = await Promise.all([serve(baseDir), serve(headDir)]);
  const browser = await chromium.launch();
  fs.mkdirSync(path.join(outDir, "base"), { recursive: true });
  fs.mkdirSync(path.join(outDir, "head"), { recursive: true });

  const baseSlugs = new Set(slugsOf(baseDir));
  const headSlugs = new Set(slugsOf(headDir));
  const rows = [];
  for (const slug of [...new Set([...baseSlugs, ...headSlugs])].sort()) {
    for (const brand of brandsOf([headDir, baseDir], slug)) {
      for (const theme of THEMES) {
        for (const width of WIDTHS) {
          const name = `${slug}__${brand}__${theme}__${width}.png`;
          const base = path.join(outDir, "base", name);
          const head = path.join(outDir, "head", name);
          if (baseSlugs.has(slug)) await shoot(browser, baseSrv.address().port, slug, brand, theme, width, base);
          if (headSlugs.has(slug)) await shoot(browser, headSrv.address().port, slug, brand, theme, width, head);
          const [hb, hh] = [hash(base), hash(head)];
          const status = !hb ? "added" : !hh ? "removed" : hb === hh ? "same" : "changed";
          rows.push({ slug, brand, theme, width, status, base: hb && `base/${name}`, head: hh && `head/${name}` });
        }
      }
    }
  }
  await browser.close();
  baseSrv.close();
  headSrv.close();

  const summary = Object.fromEntries(["changed", "added", "removed", "same"].map((k) => [k, rows.filter((r) => r.status === k).length]));
  // 같은 화면은 이미지를 지워 gh-pages 를 가볍게 한다 — 갤러리에선 "같음" 줄만 남는다.
  for (const r of rows.filter((x) => x.status === "same")) {
    fs.rmSync(path.join(outDir, r.base));
    fs.rmSync(path.join(outDir, r.head));
    r.base = r.head = null;
  }
  fs.writeFileSync(path.join(outDir, "index.html"), gallery(rows, summary));
  fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary));
  console.log(JSON.stringify(summary));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
