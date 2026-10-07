---
name: prototype-pr
description: prototypes/ 변경을 push 하고 PR 을 올려 미리보기를 띄운다. "프로토타입 PR", "미리보기 올려" 에 쓴다.
argument-hint: "[PR 제목]"
---

`prototypes/` 변경을 PR 로 올린다. 배포는 워크플로(`.github/workflows/preview.yml`)가 알아서 한다 — 여기서 올리지 않는다.

1. 현재 브랜치가 `main`이면 멈춘다. `prototypes/` 밖의 미커밋 변경이 있으면 묻는다.
2. 이 브랜치가 바꾼 폴더를 센다: `git diff --name-only origin/main...HEAD -- prototypes/ | cut -d/ -f2 | sort -u`
   (`_`로 시작하는 폴더 제외). 0개면 멈춘다 — 미리보기가 안 뜬다.
3. 폴더마다 `SPEC.md`가 있는지, 첫 줄 `# 제목`과 머리 표의 상태·담당이 채워졌는지 본다. 목록 페이지가 거기서 읽는다.
4. `index.html`에 실데이터(실제 이름·채널명·스크린샷)가 없는지 훑는다. 미리보기는 공개다.
5. 사용자 허락을 받고 `git push -u origin HEAD` 후 GitHub CLI 로 PR 을 만든다 —
   base `main`, assignee `@me`, 제목 `feat: <기능> 프로토타입`. 본문은 diff 를 반복하지 않는다:

   ```
   ## 확인받고 싶은 것
   - (리뷰어가 화면에서 봐야 할 결정 2~3개)

   ## 남은 질문
   - (SPEC.md 「남은 질문」 중 리뷰에서 답이 필요한 것)
   ```

6. 워크플로 코멘트를 기다리지 않는다. PR 주소와 "1~2분 안에 미리보기 링크가 코멘트로 달린다"만 알린다.
