---
name: generate-thumbnail
description: 블로그 포스트 썸네일을 로컬 스크립트로 생성하거나 재생성합니다
---

# 썸네일 생성

포스트의 메타데이터를 기반으로 `tools/generate-thumbnail.py` 스크립트를 사용하여 썸네일을 만듭니다.

## 입력

`$ARGUMENTS`에서 포스트 식별자를 받습니다.

예시:
- `/generate-thumbnail 2026-03-10-openclaw-rl` (slug)
- `/generate-thumbnail tech/2026-03-10-openclaw-rl.html` (파일 경로)
- `/generate-thumbnail --all tech` (카테고리 전체 재생성)

## 실행 단계

### Step 1: 메타데이터 추출

포스트 정보를 가져옵니다:

1. `posts-index.json`에서 slug 또는 파일명으로 해당 포스트를 검색합니다
2. posts-index.json에 미등록 상태면 HTML 파일에서 직접 추출합니다
3. 다음 정보를 추출합니다:
   - `title`: 포스트 제목
   - `category`: 카테고리 (research/leader/company/tech/survival)
   - `slug`: 포스트 slug
   - `date`: 발행일

### Step 2: 이미지 디렉토리 준비

```bash
mkdir -p {category}/images/{YYYY_MM_DD_slug}/
```

### Step 3: 썸네일 생성

로컬 PIL 스크립트를 실행합니다:

```bash
python3 tools/generate-thumbnail.py --category {category} --output {category}/images/{YYYY_MM_DD_slug}/thumbnail.png --seed {slug}
```

- 카테고리별 컬러 팔레트가 자동 적용됩니다
- seed 값으로 동일 slug에 대해 일관된 디자인이 생성됩니다
- 출력: 2400x1260px PNG
- **스타일**: 밝은 색 그라디언트 + 오리가미(종이접기) 스타일. 어두운 배경 금지. 밝고 깨끗한 톤을 유지합니다

### Step 4: 완료 보고

생성된 썸네일 경로를 알려줍니다:
- 파일 경로: `{category}/images/{YYYY_MM_DD_slug}/thumbnail.png`
- 미리보기 URL: `http://localhost:8080/{category}/images/{YYYY_MM_DD_slug}/thumbnail.png`
