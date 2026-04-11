# AI ROASTING 블로그

> "AI 에이전트를 고용하라" 콘텐츠 브랜드

## 프로젝트 정체성

- **독자**: 비지니스 경영 리더/팀장/조직장 (AI에 관심 있으나 비개발자, 클로드를 배우려 함)
- **관점**: 전략 컨설팅 출신 전략가 + AI 전문 강사
- **관점 프레임**: "이 정보가 AI로 사업을 성장시키려는 경영 리더에게 어떤 의미인가?"
- **URL**: https://airoasting.github.io/blog/

## 핵심 규칙 (항상 적용)

- **종결어미**: ~입니다/~합니다 (3줄 요약 포함 전체 통일)
- **문장 길이**: 40자 이내 목표, 60자 초과 금지
- **번역체 금지**: "~라고 할 수 있겠습니다" 같은 표현 불가
- **em dash(—) 금지**: 쉼표, 마침표, 괄호로 대체
- **금지 표현**: 혁명적, 획기적, 폭발적 성장, 누구나 쉽게, 패러다임 시프트, 게임 체인저
- **출처 없는 수치 사용 금지**
- **능동태** 사용, 이중 부정 금지

## 카테고리

| 카테고리 | 담는 콘텐츠 | 컬러 | 폴더 |
|----------|-------------|------|------|
| 리서치 | HBR, 컨설팅, 논문 | `#1A1A1A` | `research/` |
| 리더 | 빅테크 CEO, 석학 대담 | `#C43500` | `leader/` |
| 기업 | 조직, 경영, AX 트렌드 | `#1A4A7A` | `company/` |
| 기술 | 에이전트, 자동화, 한계 돌파 | `#145C35` | `tech/` |
| 생존 | 구조조정, 세대, 직업 변화 | `#7A1F1F` | `survival/` |

## 파일 구조

```
포스트:  {category}/YYYY-MM-DD-slug.html
이미지:  {category}/images/YYYY_MM_DD_slug/thumbnail.png
마크다운: _posts/YYYY-MM-DD-slug.md
데이터:  posts-index.json (단일 소스) → node sync-posts.js → assets/js/posts-data.js
뉴스레터: assets/js/newsletter-data.js (단일 소스) → newsletter-index.json (footer 아카이브용)
```

> **posts-index.json이 단일 소스**입니다. posts-data.js를 직접 수정한 경우 반드시 posts-index.json에도 동일 내용을 반영하세요.

> **newsletter-index.json**은 `newsletter-data.js`에서 자동 생성됩니다. `newsletter-data.js`에 에피소드를 추가하면 반드시 아래 명령으로 재생성하세요:
> ```
> node -e "const fs=require('fs');const src=fs.readFileSync('assets/js/newsletter-data.js','utf8');const json=src.replace('window.NEWSLETTER_DATA = ','').replace(/;\\s*$/,'');const d=JSON.parse(json);fs.writeFileSync('newsletter-index.json',JSON.stringify({newsletters:d.map(({ep,title,date,url})=>({ep,title,date,url}))},null,2));"
> ```

## 가이드 참조

| 목적 | 파일 | 내용 |
|------|------|------|
| 글쓰기 규칙 | `guides/editorial-rules.md` | 소스 소화, 문체 3원칙, 톤 매트릭스, 아티클 11섹션 구조, 출처 등급 |
| HTML 구현 | `guides/html-spec.md` | 카테고리 정의, 파일/이미지 저장 규칙, HTML 템플릿 변수 매핑, 전체 마크업 스펙 |
| SNS·이미지 | `guides/distribution.md` | 채널별 변환 규칙, LinkedIn 템플릿, 시리즈 연재, 이미지 디자인 기본값 |
| 검수 | `guides/qa-checklist.md` | 5관점 검수(전략/논리/실용/문체/UI), 자동·수동 구분, 발행 전 최종 체크리스트 |

## 워크플로우

```
소스 URL → /create-post → (자동) /publish-post → /update-insights → /persona-comment
```

- `/create-post`가 초고 + Navy 평가(3라운드) 완료 후 publish-post를 **자동 순차 실행** (중간 승인 없음)
- publish-post: 최종 게이트 검수 + 자동 수정 + 인덱스 등록 + `node sync-posts.js` + 발행
- update-insights: publish-post 완료 후 **자동 실행** (중간 승인 없음)
- persona-comment: update-insights 완료 후 **자동 실행** (중간 승인 없음)
- edit-post는 파이프라인에서 제외됨. 기존 포스트 수동 퇴고 시에만 사용
- 개별 실행도 가능: `/edit-post <파일>`, `/publish-post <파일>`, `/update-insights <파일>`, `/persona-comment <파일>`

## 스킬

| 명령어 | 용도 |
|--------|------|
| `/create-post <URL> [category]` | 소스(아티클/유튜브)에서 포스트 자동 생성 |
| `/edit-post <파일>` | 기존 포스트 퇴고, 문체 검수 |
| `/publish-post <파일>` | 5관점 검수 + 인덱스 업데이트 + 발행 |
| `/update-insights <파일>` | insights.html 해당 분기에 인사이트 카드 추가 |
| `/persona-comment <파일>` | 포스트 하단에 6인 페르소나 라운드테이블 댓글 삽입 |
