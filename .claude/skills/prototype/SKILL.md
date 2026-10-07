---
name: prototype
description: 새 기능·구조·디자인 시스템의 버리는 정적 HTML 프로토타입과 명세(SPEC.md)를 prototypes/ 에 만든다. "프로토타입 만들어", "기획 확정 전에 화면부터", "메뉴 구조 바꿔 보자", "디자인 토큰 바꿔 보자" 에 쓴다.
argument-hint: <slug> <한 줄 설명...>
---

프로토타입과 명세를 `prototypes/`에 만든다. 인자: `$ARGUMENTS`

먼저 `AGENTS.md`와 `context/` 네 파일을 전부 읽는다. 규칙은 거기 있고, 이 스킬은 순서만 쥔다.

1. 워킹트리에 미커밋 변경이 있으면 멈추고 묻는다.
2. 종류를 정한다 — 기능 하나면 **기능**, 메뉴·이동이면 **구조**(`app-structure/` 수정), 토큰·컴포넌트면 **디자인 시스템**(`design-system/` 수정).
   애매하면 묻는다.
3. `git switch -c proto/<slug> origin/main`.
   - 기능: `cp -r prototypes/_templates/feature prototypes/<slug>` 후 `index.html`의 `<slug>`를 바꾸고, `theme.js`의 `data-brands`에 이 화면이 나오는 앱을 적는다.
     새 화면이 메뉴에 들어가야 하면 `app-structure/shell.js`의 `APPS`도 고친다 — 그건 구조 변경이라 명세에 적는다.
   - 구조·디자인 시스템: 새 폴더를 만들지 않는다. 기존 폴더의 파일과 `SPEC.md`를 고친다(형식은 `_templates/<종류>/SPEC.md`).
4. 화면 — 정상 시나리오 하나를 끝까지 클릭으로 따라갈 수 있게 만든다. 보기 전환 바(역할·상태)를 채우고,
   숫자는 `NUM` 한 곳에. 색은 `--ds-color-*`, 버튼·카드는 `.ds-*`만. 가짜 데이터만 — 이 레포는 공개다.
5. 명세 — "이 화면에서 안 보이는 규칙"을 스스로 찾아 `SPEC.md`를 채운다. 기능이면 「기존 코드와의 관계」에
   `context/`의 어느 기능을 재사용하고 어느 제약과 부딪치는지 적는다. 정할 수 없는 것(특히 요금·정산)은 남은 질문으로.
6. 남은 질문을 사용자에게 보여 주고, 답을 받은 만큼 명세를 고친다.
7. `git commit -- prototypes/<slug>` 로 `feat: <기능> 프로토타입` 커밋. push·PR은 사용자 허락 후 `prototype-pr` 스킬로 한다.
