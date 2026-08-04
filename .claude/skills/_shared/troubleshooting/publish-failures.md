# publish-post 파이프라인 실패 정책

| 실패 지점 | 동작 |
|---|---|
| Step 3 자동 검수 2회 재채점 후 9.5점 미만 잔존 | 미달 항목·점수 명시, 발행 계속 |
| Step 6 posts-index.json 쓰기 실패 | **파이프라인 중단**, 오류 보고 |
| Step 6 `node sync-posts.js` 실패 | 발행 계속, 수동 sync 요청 |
| Step 8 sitemap.xml 실패 | 발행 계속, 수동 업데이트 요청 |
| Step 9 llms.txt/llms-full.txt 실패 | 발행 계속, 보고 |
| Step 10 update-insights 실패 | 포스트 발행 완료 간주, 별도 보고 |
| Step 12 persona-comment 실패 | 포스트 발행 완료 간주, 별도 보고 |

> **원칙**: HTML + posts-index.json 정상이면 발행됨. 부속 파일(sitemap/llms.txt/insights)은 발행을 막지 않음.

## 롤백 (사용자 명시 요청 시만)

```bash
git checkout -- posts-index.json assets/js/posts-data.js sitemap.xml llms.txt llms-full.txt insights/insights.html
git clean -n {category}/{YYYY-MM-DD-slug}.html _posts/{YYYY-MM-DD-slug}.md
```
