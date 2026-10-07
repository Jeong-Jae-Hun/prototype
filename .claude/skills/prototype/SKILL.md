---
name: prototype
description: 새 기능의 버리는 정적 HTML 프로토타입과 명세(SPEC.md)를 prototypes/<slug>/ 에 만든다. "프로토타입 만들어", "기획 확정 전에 화면부터" 에 쓴다.
argument-hint: <slug> <한 줄 설명...>
---

새 기능의 프로토타입과 명세를 `prototypes/`에 만든다. 인자: `$ARGUMENTS`

먼저 `AGENTS.md`를 전부 읽는다. 규칙은 거기 있고, 이 스킬은 순서만 쥔다.

1. 워킹트리에 미커밋 변경이 있으면 멈추고 묻는다.
2. `git switch -c proto/<slug> origin/main` 후 `cp -r prototypes/_templates/feature prototypes/<slug>`.
   `index.html` 보기 전환 바의 `spec.html?slug=<slug>`를 실제 폴더 이름으로 바꾼다.
3. `index.html`에 정상 시나리오 하나를 끝까지 클릭으로 따라갈 수 있게 만든다. 보기 전환 바(역할·상태)를 채우고,
   숫자는 파일 위쪽 `NUM` 한 곳에 모은다. 가짜 데이터만 쓴다 — 이 레포는 공개다.
4. 화면을 다 만든 뒤 "이 화면에서 안 보이는 규칙"을 스스로 찾아 `SPEC.md`를 채운다 —
   권한 표 빈칸·예외 흐름·운영이 바꾸는 숫자. 내가 정할 수 없는 것(특히 요금·정산)은 남은 질문으로 넘긴다.
5. 남은 질문을 사용자에게 보여 주고, 답을 받은 만큼 명세를 고친다.
6. `git commit -- prototypes/<slug>` 로 `feat: <기능> 프로토타입` 커밋. push·PR은 사용자 허락 후 `prototype-pr` 스킬로 한다.
