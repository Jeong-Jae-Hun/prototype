# 프로토타입 규칙

> 공용 규칙(개인정보·운영·화면·문구)은 [`context/rules.md`](context/rules.md)가 먼저다. 이 파일은 이 레포만의 방식이다.

**확정 전에는 실제 코드를 쓰지 않는다.** 버리는 HTML(`index.html`)로 화면을, 화면에 안 보이는 규칙은 명세(`SPEC.md`)로.
명세가 정본이다 — 둘이 어긋나면 명세가 맞다.

## 먼저 읽기

`context/` — 제품 현황(`features.md`)·제약(`constraints.md`)·용어(`glossary.md`)·공용 규칙(`rules.md`).
사본이라 고치지 않는다.

## 세 종류

| 종류 | 어디 | 템플릿 |
|---|---|---|
| 기능 | `prototypes/<slug>/` | `_templates/feature/` |
| 구조 (메뉴·이동) | `prototypes/app-structure/` — `shell.js` 를 고친다 | `_templates/structure/SPEC.md` |
| 디자인 시스템 | `prototypes/design-system/` — `tokens.css`·`components.css` 를 고친다 | `_templates/design-system/SPEC.md` |

모든 화면이 디자인 시스템과 앱 셸을 가져다 쓴다. 그래서 구조·디자인 시스템 PR은 **모든 화면**이 바뀐 채로 미리보기되고,
PR의 화면 비교가 무엇이 바뀌었는지 보여 준다. 여기서 정한 것은 제안이고, 확정되면 제품 레포에 반영한다.

## 화면

- **정상 흐름 2~3화면이면 충분하다.** 예외·운영자 화면은 그리지 말고 명세에 적는다.
- 색은 `--ds-color-*`, 버튼·카드는 `.ds-*` 만. 숫자는 파일 위 `NUM` 한 곳에.
- 보기 전환 바(`#view`)에 상태 고르기를 둔다. 브랜드·테마 칸은 `theme.js` 가 붙인다.
  두 앱에 다 나오면 `theme.js` 의 `data-brands` 에 둘 다 적고, 브랜드에 따라 다른 화면을 그린다.
- 서버 흉내 없이 메모리 상태만. 가짜 데이터만 — 이 레포는 공개다. 시각·난수를 그리지 않는다(화면 비교가 흔들린다).

## 명세

**한 화면 분량.** 결정 · 권한 · 상태 변화 · 숫자 · 기존 코드와의 관계 · 남은 질문.

확정(Approve) 조건:
1. 권한 표에 빈칸이 없다.
2. 남은 질문마다 담당이 있고, 구현을 막는지 적혀 있다.
3. 화면과 명세가 어긋나지 않는다.

- 요금·정산 같은 사업 결정은 남은 질문으로 넘긴다.
- 숫자는 운영이 배포 없이 바꾸는지 적는다. "예"면 어드민 화면이 필요하다.

## 만들고 올리기

Claude Code: `/prototype <slug> <설명>` → `/prototype-pr`.
손으로: `git switch -c proto/<slug> origin/main` → `cp -r prototypes/_templates/feature prototypes/<slug>` → 화면 → 명세 → PR.

PR을 올리면 워크플로가 `https://prototype.dotdotslash.me/pr-<번호>/`에 미리보기와 화면 비교(`_shots/`)를 올리고 코멘트로 단다.
머지되면 루트(확정본 목록)에 올라가고, PR 미리보기는 지워진다.
