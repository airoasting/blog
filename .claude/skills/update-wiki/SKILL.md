---
name: update-wiki
description: wiki-brain 시스템을 재생성합니다. 새 포스트 발행 후 자동 실행되어 개념 추출 · 위키 페이지 · 그래프 · 포스트 링크를 갱신합니다.
---

# /update-wiki

블로그의 위키 브레인을 재빌드합니다. 새 포스트가 추가된 후 또는 사용자가 명시적으로 호출하면 실행됩니다.

## 입력

`$ARGUMENTS`에 옵션을 받을 수 있습니다(없어도 됨):
- `--dry-run`: 변경 없이 결과만 출력
- `--skip-definitions`: 정의 재생성 건너뜀 (수동 편집 보존)
- `--force-regenerate`: 모든 정의 재생성 (수동 편집 무시)
- `--no-inject`: 포스트 HTML 갱신 생략

예시:
- `/update-wiki`
- `/update-wiki --dry-run`
- `/update-wiki --skip-definitions`

## 실행 단계

### Step 1: 빌드 실행

```bash
npm run wiki
```

(옵션이 있으면 `npm run wiki -- --skip-definitions` 식으로 전달)

ANTHROPIC_API_KEY가 환경변수로 설정되어 있으면 정의가 Claude API로 생성됩니다. 없으면 fallback 정의가 사용되고, 모든 개념이 `needs_manual_review: true` 플래그를 받습니다.

### Step 2: 빌드 리포트 읽기

`wiki/build-report.json`을 파싱하여 다음을 추출:

- `concepts.total`: 추출된 개념 수
- `concepts.needsReview`: 검수 필요 개념 수
- `relationships.total`: 관계 수
- `coverage.postsWithConcepts / totalPosts`: 포스트 커버리지
- `inject`: 포스트 HTML 갱신 통계
- `needsManualReview`: 검수 대상 개념 목록

### Step 3: 신규 개념 알림

이전 `wiki/concepts-data.json`과 비교해서 새로 추가된 개념을 식별하고 사용자에게 보고:

> 신규 개념 N개 추가됨: [이름1, 이름2, 이름3, ...]

### Step 4: 검수 권고

`needsReview` 개념이 있으면 사용자에게 안내:

> 검수 필요 개념 N개 — wiki/concepts/[slug].html에서 정의를 다듬어주세요. 그 후 `--skip-definitions` 플래그로 재빌드하면 수동 정의가 보존됩니다.

### Step 5: 변경 사항 커밋

다음 변경 사항을 모두 커밋:
- `wiki/` 전체 (concepts-data.json, *.html, build-report.json)
- `config/concept-aliases.json` (slugMap 신규 항목)
- 갱신된 포스트 HTML (`research/`, `leader/`, `company/`, `tech/`, `survival/`)

커밋 메시지 예시:
```
update: wiki-brain 재빌드 (N개 신규 개념 + M개 관계 추가)

[신규 개념 목록]

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>
```

## 워크플로우 통합

`/publish-post` 다음 단계인 `/persona-comment`가 끝난 후 자동 실행됩니다:

```
소스 URL → /create-post → /publish-post → /update-insights → /persona-comment → /update-wiki
```

## 트러블슈팅

- **`<30 concepts` 에러**: `config/concept-aliases.json`의 blacklist가 너무 광범위하거나 domainKeywords가 비어 있습니다.
- **모든 개념이 검수 필요**: ANTHROPIC_API_KEY가 설정되어 있는지 확인.
- **포스트 HTML 갱신 실패**: 해당 파일에 `<article>` 태그가 없을 가능성. build-report.json의 `inject.skipped` 확인.
