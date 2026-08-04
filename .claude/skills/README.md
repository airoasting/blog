# AI ROASTING 블로그 스킬

이 폴더는 AI ROASTING 블로그를 운영하는 Claude Code 스킬 모음입니다. 소스 URL 하나로 포스트 초고 생성부터 검수, 발행, 인사이트 등록, 페르소나 댓글, 위키 재빌드까지 한 줄로 이어집니다.

## 스킬 목록

| 스킬 | 명령어 | 하는 일 |
|------|--------|---------|
| `create-post` | `/create-post <URL> [category]` | 소스(아티클·유튜브·arXiv·X·GitHub)에서 포스트 초고 생성 |
| `edit-post` | `/edit-post <파일>` | 기존 포스트 퇴고, 문체 규칙 검수 |
| `publish-post` | `/publish-post <파일>` | 5관점 검수 + 인덱스 업데이트 + 발행 |
| `update-insights` | `/update-insights <파일>` | insights.html 해당 분기에 인사이트 카드 추가 |
| `persona-comment` | `/persona-comment <파일>` | 포스트 하단 6인 페르소나 라운드테이블 댓글 삽입 |
| `update-wiki` | `/update-wiki` | wiki-brain 재빌드 (개념 추출 + 위키 + 그래프) |
| `update-model-timeline` | `/update-model-timeline` | AI 모델 업데이트 리서치·팩트검증 후 타임라인 데이터 재생성 |

## 파이프라인

```
소스 URL → /create-post → (자동) /publish-post → /update-insights → /persona-comment → /update-wiki
```

`create-post`가 초고와 평가를 마치면 `publish-post`부터 `update-wiki`까지 중간 승인 없이 자동으로 이어집니다. `edit-post`는 파이프라인에서 빠져 있고, 기존 포스트를 수동으로 퇴고할 때만 씁니다.

## 폴더 구조

```
_shared/templates/       포스트 안에서 재사용하는 HTML 조각 (표, 이미지, 통계 카드, 라운드테이블)
_shared/troubleshooting/ 소스 수집·발행 실패 시 대응 문서
{skill}/SKILL.md         스킬 본문 (frontmatter의 name·description으로 자동 로드)
```

## 쓰는 법

Claude Code에서 이 저장소를 열면 `.claude/skills/` 아래 스킬이 자동으로 잡힙니다. 다른 곳에서 쓰려면 폴더째 복사한 뒤, 각 SKILL.md가 참조하는 경로(포스트 폴더, `posts-index.json`, `_internal/guides/`)를 자기 프로젝트 구조에 맞게 고치면 됩니다.

문체·마크업·검수 기준은 스킬이 아니라 `_internal/guides/`에 있습니다.

- `editorial-rules.md` 글쓰기 규칙
- `html-spec.md` HTML 구현 스펙
- `distribution.md` SNS·이미지 변환
- `qa-checklist.md` 5관점 검수

## 갱신 기준

- 워크플로우 순서나 검수 기준이 바뀌면 해당 SKILL.md와 루트 `CLAUDE.md`의 워크플로우 표를 함께 고칩니다.
- 새 스킬을 추가하면 이 README의 표와 `CLAUDE.md` 스킬 표 두 곳에 등록합니다.
- `.claude/` 하위에서 공개되는 것은 이 `skills/` 폴더뿐입니다. `settings.json`, `worktrees/` 등은 `.gitignore`로 계속 제외합니다.
