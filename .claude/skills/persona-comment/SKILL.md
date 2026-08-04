---
name: persona-comment
description: 포스트 하단에 6인 페르소나의 라운드테이블 댓글 토론을 생성하고 삽입합니다
---

# 페르소나 댓글 라운드테이블 생성

포스트 내용을 분석하여 6인 페르소나 중 적합한 3인을 선발하고,
실제 독자처럼 토론하는 중첩 댓글 섹션을 HTML에 삽입합니다.

## 입력

`$ARGUMENTS`에서 포스트 파일 경로를 받습니다.

예시:
- `/persona-comment research/2026-04-02-claude-emotion-vectors.html`
- `/persona-comment tech/2026-03-10-openclaw-rl.html`

## 실행 단계

### Step 1: 포스트 및 페르소나 로드

1. 지정된 HTML 파일을 읽습니다
2. `.claude/skills/persona-comment/personas.md`를 읽어 페르소나 정의를 로드합니다

### Step 2: 포스팅 타입 판별 및 페르소나 선택

포스트 본문을 분석하여 포스팅 타입을 판별합니다:

| 포스팅 타입 | 판별 기준 | 권장 조합 |
|---|---|---|
| AI 툴 리뷰 | 특정 도구/제품 소개, 기능 분석 | 골드 + 네이비 + 화이트 |
| 트렌드 분석 | 시장/산업 동향, 통계 데이터 | 블랙 + 레드 + 화이트 |
| 실무 가이드 | 단계별 방법론, 실행 지침 | 네이비 + 골드 + 퍼플 |
| 뉴스 논평 | 최신 발표, 사건, 정책 | 레드 + 블랙 + 화이트 |
| 팀 도입 사례 | 조직 변화, HR, 도입 경험 | 퍼플 + 화이트 + 골드 |
| 연구/논문 | 학술 결과, 실험 데이터 | 레드 + 네이비 + 블랙 |

타입이 불분명하면 블랙 + 레드 + 화이트를 기본으로 사용합니다.

### Step 3: 댓글 토론 생성

**전체 구조: 6인 전원 등장, 3개 스레드**

각 스레드는 독립적인 논점을 다룹니다.
논점은 포스트 본문의 구체적 내용에서 도출합니다 (뜬구름 금지).
6인이 모두 최소 1회 이상 발언해야 합니다.

**스레드 구조 — 매번 다르게 변주:**

스레드마다 구조를 다르게 설계합니다. 아래 패턴 중 하나씩 선택:

```
패턴 A — 1:1 충돌형
[원댓글] A — 주장
  └─ [댓글] B — 정면 반박
      └─ [대댓글] A — 재반박 (강도 높임)

패턴 B — 끼어들기형
[원댓글] A — 주장
  └─ [댓글] B — 동의+심화
  └─ [댓글] C — 전혀 다른 각도로 끼어듦 (B 무시하고 A에게 직접)

패턴 C — 연쇄 반응형
[원댓글] A — 질문 또는 도발
  └─ [댓글] B — 답변
      └─ [대댓글] C — B의 답에 태클
          └─ [대대댓글] B 또는 A — 마무리

패턴 D — 단발 논평형 (짧은 스레드)
[원댓글] A — 날카로운 한마디
  └─ [댓글] B — 동의 또는 반박 한마디
```

스레드 3개에 패턴 3가지를 조합하여 단조로움을 방지합니다.
6인 배분 예시: 스레드1(A+B+C), 스레드2(D+E+C), 스레드3(A+F) 등 — 중복 등장 허용.

**댓글 작성 규칙:**

1. **말투**: 실제 인터넷 댓글처럼 자연스러운 한국어. 격식체 금지. 중학생도 이해할 수 있는 쉬운 단어만 사용. 위트 있게 — 읽는 사람이 피식 웃거나 "맞아맞아" 할 수 있게. 아래 페르소나별 말투 기준을 따름.
   - 블랙: 짧고 단호하게. "해야 해요." "안 해요? 뒤처져요." 결론부터 말함.
   - 레드: 질문으로 따지기. "그게 어디서 나온 숫자예요?" "증명할 수 있어요?" 일상적 언어로.
   - 골드: 수다스럽고 솔직하게. "저도 써봤는데요," "근데 솔직히" 경험 중심으로.
   - 네이비: 건조하게 숫자만. "3일, 2주, 6주. 이게 현실이에요." 감정 없음.
   - 퍼플: 이야기하듯 감성적으로. "~느낌이에요" "~같더라고요" 비유 많이.
   - 화이트: 현실적 혼란. "그래서 저는 뭘 하면 되는 거예요?" 중간관리자 압박감.
2. **주술 구조 필수**: 주어와 서술어가 항상 맞아야 함. 구어체여도 문장이 완결되어야 함.
3. **길이**: 발언 하나당 2~3문장. 짧고 밀도 있게. 마지막 문장은 여운이나 훅으로.
4. **페르소나 충실도**: personas.md의 핵심 질문과 긴장 관계를 반드시 반영.
5. **상호 참조**: 상대방 발언의 구체적 내용을 콕 집어 반응. 추상적 반박 금지.
6. **포스트 인용**: 본문의 수치·사례·표현을 직접 인용하여 근거로 활용.
7. **긴장 구도 활용**: 긴장 관계 페어가 포함되면 날카롭게 충돌. 예의 바른 토론 금지.
8. **동의도 자연스럽게**: 동의할 땐 "맞아요, 근데—"처럼 한 발 더 나가기.
9. **금지**: 문어체, 발표 말투, "~라고 생각합니다", 보고서 문체, 어려운 전문 용어.

**스레드 논점 선택 기준:**
- 스레드 1: 포스트의 핵심 주장에 대한 찬반
- 스레드 2: 실무 적용 가능성 또는 데이터 신뢰도에 대한 논쟁

### Step 4: HTML 생성

아래 마크업 구조를 사용합니다. 인라인 스타일로 완전 자급합니다
(외부 CSS 의존 없음).

```html
<!-- 라운드테이블 댓글 -->
<section id="section-roundtable" style="margin-top:40px; padding:32px; background:#F7F7F5; border-radius:12px;">
  <div style="display:flex; align-items:center; gap:10px; margin-bottom:24px;">
    <div style="font-size:13px; font-weight:800; letter-spacing:0.12em; text-transform:uppercase; color:#888;">라운드테이블</div>
    <div style="flex:1; height:1px; background:#E0E0DC;"></div>
  </div>

  <!-- 스레드 1 -->
  <div style="margin-bottom:32px;">

    <!-- 원댓글 -->
    <div style="display:flex; gap:12px; align-items:flex-start;">
      <div style="width:36px; height:36px; border-radius:50%; background:{페르소나색}; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; margin-top:2px;">{이니셜}</div>
      <div style="flex:1; background:#fff; border-radius:10px; padding:14px 16px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <div style="font-size:13px; font-weight:700; color:{페르소나색}; margin-bottom:6px;">{페르소나명} <span style="font-weight:400; color:#aaa;">· {직함}</span></div>
        <div style="font-size:13px; line-height:1.75; color:#222;">{발언 내용}</div>
      </div>
    </div>

    <!-- 댓글 (들여쓰기) -->
    <div style="display:flex; gap:12px; align-items:flex-start; margin-left:44px; margin-top:12px;">
      <div style="width:36px; height:36px; border-radius:50%; background:{페르소나색}; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; margin-top:2px;">{이니셜}</div>
      <div style="flex:1; background:#fff; border-radius:10px; padding:14px 16px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <div style="font-size:13px; font-weight:700; color:{페르소나색}; margin-bottom:6px;">{페르소나명} <span style="font-weight:400; color:#aaa;">· {직함}</span></div>
        <div style="font-size:13px; line-height:1.75; color:#222;">{발언 내용}</div>
      </div>
    </div>

    <!-- 대댓글 (추가 들여쓰기) -->
    <div style="display:flex; gap:12px; align-items:flex-start; margin-left:88px; margin-top:12px;">
      <div style="width:36px; height:36px; border-radius:50%; background:{페르소나색}; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; margin-top:2px;">{이니셜}</div>
      <div style="flex:1; background:#fff; border-radius:10px; padding:14px 16px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <div style="font-size:13px; font-weight:700; color:{페르소나색}; margin-bottom:6px;">{페르소나명} <span style="font-weight:400; color:#aaa;">· {직함}</span></div>
        <div style="font-size:13px; line-height:1.75; color:#222;">{발언 내용}</div>
      </div>
    </div>

  </div><!-- /스레드 1 -->

  <!-- 구분선 -->
  <div style="border-top:1px solid #E8E8E4; margin-bottom:28px;"></div>

  <!-- 스레드 2: 동일 구조 반복 -->

</section>
```

**페르소나별 색상 및 이니셜:**

| 페르소나 | 색상 | 이니셜 | 직함 |
|---|---|---|---|
| 블랙 | `#1A1A1A` | B | 중견기업 임원 |
| 레드 | `#C43500` | R | 저널리스트 |
| 골드 | `#C49000` | G | 창업자 |
| 네이비 | `#1A4A7A` | N | 시니어 엔지니어 |
| 퍼플 | `#6B3FA0` | P | 마케터 |
| 화이트 | `#555555` | W | 조직장 |

> **다크모드 참고:** 블랙(`#1A1A1A`)과 화이트(`#555555`) 이름 색상은 다크 배경에서 안 보일 수 있으나, `style.css`에 `[data-theme="dark"] #section-roundtable div[style*="color:#1A1A1A"]` 및 `color:#555555` 오버라이드가 정의되어 있어 자동 처리됩니다. 인라인 색상 값을 변경하지 마십시오.

### Step 5: HTML 삽입

**삽입 순서**: 참고자료 → 라운드테이블 → (`.post-body` 닫힘) → TOC 사이드바 → (`.post-body-layout` 닫힘)

> 참고자료 아래 별도 `원문 보기 →` CTA 버튼은 더 이상 두지 않습니다. 원문 링크는 참고자료 각 항목의 `(원문 보기 ↗)`로 일원화합니다.

> **중요**: 라운드테이블은 반드시 `.post-body` div **안에** 삽입해야 합니다.
> `.post-body-layout` 밖에 넣으면 TOC 영역까지 가로 확장되어 레이아웃이 깨집니다.

**작업 순서:**

1. `section-references`에 `style="margin-bottom:0;"` 추가:
```
찾기:  <section class="post-section" id="section-references">
교체:  <section class="post-section" id="section-references" style="margin-bottom:0;">
```

2. 참고자료 `</section>` 닫힘 직후 (`</div><!-- /.post-body -->` 바로 앞) 에 라운드테이블 HTML을 삽입합니다.

```
삽입 위치 예시:
          </section>        ← 참고자료 섹션 끝

          <!-- 라운드테이블 댓글 -->
          <section id="section-roundtable" ...>
            ...
          </section>

        </div><!-- /.post-body -->   ← 이 앞에 삽입
```

실제 파일을 읽어 `</div><!-- /.post-body -->` 위치를 확인한 뒤 정확한 삽입 위치를 결정합니다.

삽입 후 파일을 저장합니다.

### Step 6: TOC 업데이트

포스트 내 TOC 항목에 라운드테이블 링크를 추가합니다.
모바일 TOC(`toc-mobile-overlay`)와 사이드바 TOC(`toc-sidebar`) 두 곳 모두 수정합니다.

```
찾기 (두 곳 모두):  <li><a href="#section-references" class="toc-link">참고자료</a></li>
교체:               <li><a href="#section-references" class="toc-link">참고자료</a></li>
                    <li><a href="#section-roundtable" class="toc-link">라운드테이블</a></li>
```

`replace_all: true` 로 한 번에 처리합니다.

### Step 7: 완료 보고

다음을 출력합니다:
- 선택된 페르소나 및 선택 이유
- 각 스레드 논점 요약
- TOC 추가 확인
- 삽입 완료 메시지
