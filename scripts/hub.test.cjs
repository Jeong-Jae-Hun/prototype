const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { readSpec, collect, render } = require("./hub.cjs");

const spec = (title, status) => `# ${title}\n\n| 항목 | 내용 |\n|---|---|\n| 상태 | ${status} |\n| 담당 | 기획 @a · 개발 @b |\n`;

function fixture(dirs) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "hub-"));
  for (const [slug, f] of Object.entries(dirs)) {
    fs.mkdirSync(path.join(root, slug));
    if (f.html !== false) fs.writeFileSync(path.join(root, slug, "index.html"), "<p>x</p>");
    if (f.spec) fs.writeFileSync(path.join(root, slug, "SPEC.md"), f.spec);
  }
  return root;
}

test("SPEC.md 머리에서 제목·상태·담당을 읽는다", () => {
  assert.deepEqual(readSpec(spec("팬 챗", "검토 중")), { title: "팬 챗", status: "검토 중", owners: "기획 @a · 개발 @b" });
});

test("_ 폴더와 index.html 없는 폴더는 빼고, 검토 중 → 초안 → 확정 → 그 밖 순서로 늘어놓는다", () => {
  const root = fixture({
    _template: { spec: spec("템플릿", "초안") },
    "no-html": { spec: spec("화면 없음", "초안"), html: false },
    done: { spec: spec("끝남", "확정") },
    draft: { spec: spec("초안임", "초안") },
    review: { spec: spec("검토", "검토 중") },
    blank: { spec: spec("템플릿 그대로", "초안 / 검토 중 / 확정") },
    nospec: {},
  });
  assert.deepEqual(collect(root).map((i) => i.slug), ["review", "draft", "done", "blank", "nospec"]);
});

test("명세 문자열을 그대로 HTML 에 넣지 않는다", () => {
  const html = render([{ slug: "x", title: "<script>alert(1)</script>", status: "초안", owners: "" }], { heading: "확정본", linkPrefix: "", specPrefix: "" });
  assert.ok(!html.includes("<script>alert"));
  assert.ok(html.includes('href="x/"'));
  assert.ok(html.includes('href="spec.html?slug=x"'));
});

test("목록이 비면 빈 상태를 보인다", () => {
  assert.ok(render([], { heading: "확정본", linkPrefix: "", specPrefix: "" }).includes("아직 프로토타입이 없다"));
});
