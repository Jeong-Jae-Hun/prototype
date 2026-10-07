// 프로토타입 허브 — prototypes/ 의 폴더를 훑어 목록 페이지(index.html)를 만든다.
// .github/workflows/preview.yml 이 gh-pages 에 올리기 직전에 부른다. 결과물은 커밋하지 않는다(prototypes/index.html 은 gitignore).
// 제목·상태·담당은 각 폴더 SPEC.md 머리에서 읽는다 — 목록을 손으로 따로 적으면 명세와 어긋난다.
//
// 사용: node scripts/hub.cjs <prototypes 경로> <제목> <링크 접두사> <명세 링크 접두사>
//   예: node scripts/hub.cjs prototypes "확정본" "" "https://github.com/o/r/blob/main/prototypes"

const fs = require("node:fs");
const path = require("node:path");

const STATUS_ORDER = ["검토 중", "초안", "확정"];

function readSpec(text) {
  const row = (key) => text.match(new RegExp(`^\\|\\s*${key}\\s*\\|\\s*(.+?)\\s*\\|\\s*$`, "m"))?.[1] ?? "";
  return {
    title: text.match(/^#\s+(.+)$/m)?.[1].trim() ?? "",
    status: row("상태"),
    owners: row("담당"),
  };
}

function collect(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_") && fs.existsSync(path.join(dir, d.name, "index.html")))
    .map((d) => {
      const spec = path.join(dir, d.name, "SPEC.md");
      return { slug: d.name, ...readSpec(fs.existsSync(spec) ? fs.readFileSync(spec, "utf8") : "") };
    })
    .sort((a, b) => rank(a.status) - rank(b.status) || a.slug.localeCompare(b.slug));
}

// 템플릿 그대로의 "초안 / 검토 중 / 확정" 같은 값은 맨 뒤로 보낸다 — 아직 아무도 상태를 안 적은 것이다.
function rank(status) {
  const i = STATUS_ORDER.indexOf(status);
  return i === -1 ? STATUS_ORDER.length : i;
}

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function render(items, { heading, linkPrefix, specPrefix }) {
  const rows = items
    .map((it) => `
      <li>
        <a class="open" href="${esc(linkPrefix)}${esc(it.slug)}/">
          <span class="status" data-status="${esc(it.status)}">${esc(it.status || "상태 없음")}</span>
          <span class="title">${esc(it.title || it.slug)}</span>
          <span class="slug">${esc(it.slug)}</span>
        </a>
        <div class="meta">${esc(it.owners)}${specPrefix ? ` · <a href="${esc(specPrefix)}/${esc(it.slug)}/SPEC.md">명세</a>` : ""}</div>
      </li>`)
    .join("");
  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>프로토타입 — ${esc(heading)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <style>
    body { margin: 0; font-family: Pretendard, system-ui, sans-serif; background: #0b0b10; color: #f4f4f6; letter-spacing: -0.01em; }
    main { max-width: 760px; margin: 0 auto; padding: 32px 16px; }
    h1 { font-size: 24px; margin: 0 0 4px; }
    p { color: #9a9aab; margin: 0 0 24px; font-size: 14px; }
    ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
    li { border: 1px solid #262633; border-radius: 16px; padding: 14px 16px; background: #15151d; }
    a { color: inherit; }
    .open { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; text-decoration: none; }
    .title { font-weight: 700; flex: 1 1 200px; }
    .slug, .meta { color: #9a9aab; font-size: 13px; }
    .meta { margin-top: 6px; }
    .status { font-size: 12px; padding: 2px 8px; border-radius: 999px; background: #2d2d3a; color: #c4c4d0; }
    .status[data-status="확정"] { background: rgba(80, 200, 140, 0.18); color: #8fe3b8; }
    .status[data-status="검토 중"] { background: rgba(137, 86, 251, 0.2); color: #d0bdff; }
    .empty { color: #9a9aab; }
  </style>
</head>
<body>
  <main>
    <h1>프로토타입 · ${esc(heading)}</h1>
    <p>버리는 화면이다. 규칙은 명세가 정본이다. 프로토타입과 명세가 어긋나면 명세가 맞다.</p>
    ${items.length ? `<ul>${rows}</ul>` : `<div class="empty">아직 프로토타입이 없다.</div>`}
  </main>
</body>
</html>
`;
}

module.exports = { readSpec, collect, render };

if (require.main === module) {
  const [dir, heading, linkPrefix = "", specPrefix = ""] = process.argv.slice(2);
  if (!dir || !heading) {
    console.error("Usage: proto-hub.cjs <dir> <heading> [linkPrefix] [specPrefix]");
    process.exit(1);
  }
  process.stdout.write(render(collect(dir), { heading, linkPrefix, specPrefix }));
}
