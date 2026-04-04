---
description: 포스트 식별자를 받아 블로그 규칙에 맞는 썸네일을 안정적으로 생성 또는 재생성
---
사용자가 포스트의 slug 또는 HTML 파일 경로를 주면, 아래 순서로 썸네일 생성 작업을 수행합니다.

## 목표

- 저장 규칙을 반드시 지킵니다.
- 경로: `{category}/images/{YYYY_MM_DD_slug}/thumbnail.png`
- 기본 방식은 ChatGPT 기반 OpenAI 이미지 생성입니다.
- 로컬 PIL 생성기는 fallback입니다.

## 입력 해석

1. 사용자의 입력이 slug인지, 파일 경로인지 판단합니다.
2. 우선 `posts-index.json`에서 일치하는 포스트를 찾습니다.
3. 인덱스에 없으면 HTML 파일에서 아래 값을 직접 읽습니다.
   - `title`
   - `category`
   - `date`
   - `slug`
4. 최종 출력 디렉토리를 계산합니다.
   - 예: `tech/images/2026_03_10_openclaw-rl/thumbnail.png`

## 기본 생성 방식

기본값은 ChatGPT 기반 OpenAI 이미지 생성입니다.

1. 기사 내용을 읽고 핵심 오브제 1개를 뽑습니다.
2. 아래 값을 준비합니다.
   - `title`
   - `category`
   - `tags`
   - `summary`
   - `slug`
3. 프롬프트 초안을 만든 뒤, 아래 리뷰 루프를 반드시 거칩니다.
   - 역할: 20년차 베테랑 보그 매거진 디자이너 겸 사진사
   - 1차 리뷰: 오브제 선명도, 시선 집중, 구도, 조명, 질감, 잡지 커버급 완성도 점검
   - 1차 수정: 과한 요소를 덜고, 핵심 오브제를 더 강하게 만듭니다.
   - 2차 리뷰: 세련도, 독창성, 여백 운용, 감정 톤, 프리미엄 에디토리얼 무드 점검
   - 2차 수정: 최종 프롬프트로 압축합니다.
4. 먼저 OpenAI 환경을 확인합니다.
   - `OPENAI_API_KEY` 존재
5. 기본 명령은 아래를 사용합니다.
   - `python3 tools/generate-thumbnail-openai.py --slug {full_slug} --category {category} --title "{title}" --tags "{tags}" --summary "{summary}" --output {category}/images/{YYYY_MM_DD_slug}/thumbnail.png`
6. 이 생성기는 다음 기준을 따릅니다.
   - ChatGPT 기반 OpenAI Responses API 사용
   - `image_generation` 도구 사용
   - 기본 크기 `1536x1024`
   - 기본 품질 `high`
   - 내부적으로 2차 리뷰, 수정 루프를 거친 최종 프롬프트 사용
   - 텍스트 없는 오리가미 스타일 유지

## Fallback 방식

OpenAI 생성이 불가능하면 로컬 생성기로 즉시 전환합니다.

1. 전환 조건은 아래 중 하나입니다.
   - `OPENAI_API_KEY` 없음
   - API 호출 실패
   - 응답에 이미지 데이터 없음
2. fallback 명령은 아래를 사용합니다.
   - `python3 tools/generate-thumbnail.py --category {category} --output {category}/images/{YYYY_MM_DD_slug}/thumbnail.png --seed {full_slug}`
3. fallback 실행 사실을 완료 보고에 반드시 적습니다.

## 검증

생성 후 아래를 확인합니다.

1. 파일이 실제로 생성되었는지 확인합니다.
2. 경로가 블로그 규칙과 일치하는지 확인합니다.
3. PNG인지 확인합니다.
4. 크기가 `1536x1024`, `2400x1260`, `1200x630` 중 하나이거나 의도한 가로형 비율인지 확인합니다.
5. 실패 시 원인과 재실행 명령을 함께 보고합니다.

## 보고 형식

완료 시 아래만 간단히 알립니다.

- 사용한 방식: OpenAI 생성 또는 로컬 fallback
- 프롬프트 리뷰: 2차 리뷰 완료 여부
- 저장 경로
- 필요 시 미리보기 URL
  - `http://localhost:8080/{category}/images/{YYYY_MM_DD_slug}/thumbnail.png`

## 금지 사항

- 루트 `images/` 경로에 저장하지 않습니다.
- 존재하지 않는 도구 이름을 가정하지 않습니다.
- 썸네일 안에 텍스트를 넣지 않습니다.
- OpenAI 실패를 숨기지 않습니다.
