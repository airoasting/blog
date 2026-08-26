---
name: publish-post
description: 포스트의 5관점 검수를 실행하고 인덱스 업데이트 및 발행을 처리합니다
---

# 포스트 발행

`$ARGUMENTS`에서 포스트 파일 경로를 받습니다. 예: `/publish-post tech/2026-03-10-openclaw-rl.html`

## Step 1: 포스트 로드

HTML 파일을 읽습니다.

## Step 2: 최우선 3원칙 최종 게이트

CLAUDE.md의 3원칙·금지 표현·em dash를 0건 기준으로 재검수. 위반 즉시 수정 후 Step 3 진행.

## Step 3: 5관점 자동 검수

`guides/qa-checklist.md`의 자동화 가능 항목을 실행합니다. **각 항목 10점, 모두 9.5점 이상**이면 통과. 체크 카테고리:

- **논리·팩트**: 날짜-소스 일치, 금지 표현, 수치 출처, `<h3>` 없음, 기술 용어 괄호 설명
- **스토리·문체**: 60자 초과, 3줄 요약 입니다/합니다체, **제목 명사구 헤드라인 준수(서술 종결 `~습니다`/`~입니다`/계사 `~이다` 금지, 40자 이내)**, em dash, 컨텍스트 5문장, 문장 연결, 3~5문장 문단, APA 참고자료
- **구조·동기화**: Roasting quote 4곳 동기화, Roasting quote 높임말, 빈 비즈니스 비용 섹션, 액션 스텝 마크업
- **표/차트**: 한국어 헤더, bold 강조, 출처 표기, overflow-x 래퍼, 10행 이상 선별, 문단 아래 배치
- **UI·성능**: lazy loading, word-break: keep-all, alt 텍스트, 메타/OG/JSON-LD

구체 기준은 `guides/qa-checklist.md` 참조.

## Step 4: 수동 검수 안내 (사용자 출력)

- **전략**: 왜 지금 필요한가? 우리만의 관점?
- **실용성**: "내 사업에 어떻게?" / 비개발자 따라 가능?
- **스토리**: 첫 3문장 훅? 끝까지 읽히나?

## Step 5: 검수 리포트

통과 항목 나열 금지. 실패만 출력:
- 전체 통과: `✅ 자동 검수 전체 통과 — 발행 진행합니다.`
- 실패: 항목·문제·수정안 테이블 → **즉시 자동 수정 후 재검수**. 최대 2회 재검수 후에도 미달 시 명시하고 발행 계속.

파이프라인 실패 정책·롤백은 `.claude/skills/_shared/troubleshooting/publish-failures.md` 참조 (실패 시에만).

## Step 6: 인덱스 업데이트

1. **posts-index.json**: slug 존재 → 기존 항목 업데이트 / 없음 → `posts` 배열 맨 앞 추가 + 이전 최신 글의 `next_post`를 현재 slug으로
2. `node sync-posts.js` 실행
3. posts-index.json ↔ posts-data.js 포스트 수 일치 검증

> 뉴스레터 아카이브는 블로그 발행 시 수정 불필요 (CLAUDE.md 참조).

## Step 7: _posts/ 마크다운 생성

`_posts/{YYYY-MM-DD-slug}.md`가 있으면 건너뜀. 없으면 `guides/qa-checklist.md` Section 4 `#markdown-conversion` 변환 규칙 적용.

구조: `# 제목` → `## 3줄 요약` (bullet 3개) → `## {섹션 레이블}` 본문. 제외: 네비, 헤더, TOC, 스크립트, 메타, CSS, 썸네일, 푸터.

## Step 8: sitemap.xml

새 포스트 URL이 없으면 `</urlset>` 앞에 `<url><loc>.../{category}/{slug}.html</loc><lastmod>{YYYY-MM-DD}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>` 추가. 이미 있으면 `<lastmod>`만 오늘 날짜. 카테고리 페이지·홈페이지 `<lastmod>`도 갱신.

## Step 9: llms.txt / llms-full.txt

- **llms.txt** `## 최신 포스트` 섹션을 posts-index.json 기준 전체 재작성: `- {YYYY-MM-DD} [{카테고리 한국어}] {제목} — /blog/{category}/{slug}.html` (날짜 내림차순). 카테고리 한국어: research→리서치/leader→리더/company→기업/tech→기술/survival→생존
- **llms-full.txt**: 파일 맨 앞 헤더 뒤에 새 포스트 섹션 삽입 (제목/날짜/카테고리/소스/원문/태그/3줄 요약/Roasting). 중복이면 건너뜀

## Step 10: insights.html 업데이트

`/update-insights {path}` 자동 실행.

## Step 11: insights.html 뉴스레터·포스트 개수 동기화

- 뉴스레터 수: `assets/js/newsletter-data.js` 배열 길이
- 포스트 수: `posts-index.json` posts 배열 길이
- 합계 반영 4곳: `<h1>` `{합계}화의 기록,` / `<p class="ins-hero-desc">` "뉴스레터 N화와 블로그 포스트 M개, 총 (N+M)화에서 추출했습니다." / `<div class="ins-stat-num">` 각각 / `<meta name="description">`

## Step 12: 페르소나 댓글

`/persona-comment {path}` 자동 실행.

## Step 13: 완료 보고

HTML / 마크다운 / posts-index.json / posts-data.js / sitemap / llms / insights / 로컬 URL 경로를 나열하고, 다음 단계(모바일 확인, commit, SNS 배포) 체크리스트 출력.
