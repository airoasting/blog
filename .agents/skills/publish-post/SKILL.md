---
name: publish-post
description: 포스트의 5관점 검수를 실행하고 인덱스 업데이트 및 발행을 처리합니다
---

# 포스트 발행

포스트의 최종 검수를 실행하고, 인덱스 업데이트 및 발행 준비를 완료합니다.

## 입력

`$ARGUMENTS`에서 포스트 파일 경로를 받습니다.

예시:
- `/publish-post tech/2026-03-10-openclaw-rl.html`
- `/publish-post research/2026-03-05-brain-fry.html`

## 실행 단계

### Step 1: 포스트 및 가이드 로드

1. 지정된 HTML 파일을 읽습니다
2. `guides/qa-checklist.md`를 읽어 검수 기준을 로드합니다
3. `guides/html-spec.md`를 읽어 HTML 스펙을 로드합니다

### Step 2: 최우선 3원칙 최종 검수

edit-post를 거쳤더라도 **최종 게이트로 3원칙을 재검수**합니다. 위반 문장이 있으면 즉시 수정합니다.

**원칙 1. 자연스러운 한국어**: 번역체("~라고 할 수 있겠습니다", "~에 대해" 남용, "~것으로 보입니다"), 어색한 조사 → 자연스러운 표현으로 교체
**원칙 2. 주술 근접**: 주어와 술어 사이 수식어 3개 이상 → 문장 분리
**원칙 3. 이해하기 쉽게**: 한 문장 2개 이상 정보 → 분리, 추상적 표현 → 구체적 수치/행동

> 3원칙 위반 0건 확인 후 다음 검수로 넘어갑니다.

### Step 3: 5관점 자동 검수

`guides/qa-checklist.md`의 자동화 가능 항목을 실행합니다:

**논리·팩트 (레드):**
- [ ] 금지 표현 패턴 검출: 0건 확인
- [ ] 수치에 출처 동반 여부
- [ ] `<h3>` 태그 본문 내 없음 (`<p><strong>` 패턴 사용)
- [ ] 기술 용어 Lv.2 첫 등장 시 괄호 설명 존재

**스토리·문체 (퍼플):**
- [ ] 60자 초과 문장 없음
- [ ] 3줄 요약 입니다/합니다 체
- [ ] em dash 없음
- [ ] 컨텍스트 섹션 5문장 이하
- [ ] 모든 문단 3~5문장 (초과 시 분리)
- [ ] 참고자료 APA 형식 (연도+월, [Video/Article], URL 전문)

**구조·동기화:**
- [ ] Roasting quote 4곳 동기화 (blockquote, data 속성, JS 상수, posts-index.json)
- [ ] Roasting quote 높임말 확인 (~입니다/~합니다/~습니까? 종결. 비높임말 발견 시 즉시 수정)
- [ ] 비즈니스 비용 빈 섹션 없음 (해당 없으면 섹션 생략)
- [ ] 액션 스텝 마크업: action-num + action-body 구조

**UI·성능 (화이트):**
- [ ] lazy loading 적용 (히어로 제외)
- [ ] word-break: keep-all 적용
- [ ] alt 텍스트 존재 여부
- [ ] 메타 태그 (description, OG, Twitter Card, JSON-LD) 완전성

### Step 4: 수동 검수 안내

자동으로 판단할 수 없는 항목을 사용자에게 체크리스트로 제시합니다:

**전략 (블랙):**
- 이 글이 왜 지금 필요한지 명확한가?
- 경쟁 콘텐츠 대비 우리만의 관점이 있는가?

**실용성 (골드):**
- "내 사업에 어떻게 쓰라는 건데?"에 답하는가?
- 비개발자가 따라 할 수 있는가?

**스토리 (퍼플):**
- 첫 3문장이 독자를 붙잡는가?
- 끝까지 읽히는 구조인가?

### Step 5: 검수 리포트

```
## 발행 검수 리포트

### 자동 검수 결과
- 금지 표현: ✅ 0건 / ❌ {N}건
- 60자 초과: ✅ 없음 / ❌ {N}건
- 종결어미: ✅ 통과 / ❌ 불일치
- em dash: ✅ 없음 / ❌ {N}건
- lazy loading: ✅ / ❌
- 메타 태그: ✅ 완전 / ❌ 누락 항목: {목록}

### 수동 확인 필요
- [ ] 전략 관점 확인
- [ ] 실용성 관점 확인
- [ ] 스토리 관점 확인
```

자동 검수에서 ❌ 항목이 있으면 **즉시 자동으로 수정**합니다 (사용자 승인 대기 없음).
**최대 2회 재검수** 후에도 미통과 시 문제 항목을 리포트에 명시하되, 발행은 계속 진행합니다.

### Step 6: 인덱스 업데이트

검수 완료 후 자동으로 진행합니다:

1. **posts-index.json 업데이트**:
   - 해당 slug이 posts-index.json에 **이미 존재하면** 기존 항목을 업데이트한다 (제목, 태그, 요약 등 변경 반영)
   - **없으면** `posts` 배열 맨 앞에 새 포스트 항목 추가하고, 이전 최신 글의 `next_post` 필드를 현재 포스트 slug으로 업데이트

2. **posts-data.js 동기화**:
   ```bash
   node sync-posts.js
   ```

3. **동기화 검증**:
   - posts-index.json과 posts-data.js의 포스트 수 일치 확인

### Step 7: _posts/ 마크다운 확인

`_posts/{YYYY-MM-DD-slug}.md` 파일이 존재하는지 확인합니다. 없으면 HTML 본문에서 마크다운을 추출하여 생성합니다.

### Step 8: 완료 보고

```
## 발행 완료

- HTML: {category}/{YYYY-MM-DD-slug}.html
- 마크다운: _posts/{YYYY-MM-DD-slug}.md
- 썸네일: {category}/images/{YYYY_MM_DD_slug}/thumbnail.png
- 인덱스: posts-index.json 업데이트 완료
- 동기화: posts-data.js 동기화 완료
- 로컬 미리보기: http://localhost:8080/{category}/{YYYY-MM-DD-slug}.html

### 다음 단계
- [ ] 모바일 미리보기 확인
- [ ] git commit & push
- [ ] SNS 배포 (guides/distribution.md 참조)
```
