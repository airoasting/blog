# AI Model Timeline Research

- Research date: 2026-07-17
- Coverage start: 2026-07-01
- Coverage end: 2026-07-17
- Run type: incremental
- Sources checked: 공식 블로그 6건, 뉴스 8건, 벤더 뉴스룸 4건

> 베이스라인은 기존 `timeline/data/model-timeline.md`(last_updated 2026-07-05, period_end 2026-07-01)입니다. 이번 실행은 그 이후 2026-07-01~07-17 신규 이벤트만 증분 조사했습니다.

## Scope
- 이번 실행 조사 제공사: Google, xAI, OpenAI, Meta, Moonshot AI
- 조사 안 함(변동 없음 확인): Anthropic(6/30 Sonnet 5, 7/1 Fable/Mythos 복원 이미 반영), DeepSeek, Alibaba, ByteDance, Mistral, Z.ai, LG

## New or Updated Events
| Date | Provider | Model | Event Type | Significance | Source 1 | Source 2 |
|------|----------|-------|-----------|--------------|----------|----------|
| 2026-07-01 | Google | Gemini Omni Flash | release | major | blog.google | cloud.google.com |
| 2026-07-01 | Google | Nano Banana 2 Lite | release | minor | blog.google | cloud.google.com |
| 2026-07-08 | xAI | Grok 4.5 | release | major | x.ai/news/grok-4-5 | techcrunch.com |
| 2026-07-09 | OpenAI | GPT-5.6 (Sol/Terra/Luna) | release | major | openai.com | help.openai.com |
| 2026-07-09 | Meta | Muse Spark 1.1 | release | major | ai.meta.com | bloomberg.com |
| 2026-07-16 | Moonshot AI | Kimi K3 | release | major | marktechpost.com | fortune.com |

## Notes
- **Google Gemini 3.5 Pro**: 여러 매체가 7/17 GA를 지목하나 구글 공식 발표·모델 ID·컨텍스트·가격 모두 미확정. 공식 출처 부재로 이번 타임라인에 **미포함**. 확정 시 다음 증분에 추가.
- **Moonshot AI**는 기존 provider 행에 없음. Kimi K3가 major(2.8T 오픈웨이트, Fable 5급 주장)이라 신규 행 추가 필요(중국, lead=Kimi).
- GPT-5.6는 기존 데이터에 2026-06-26 "제한 공개(preview)"로 존재. 이번 07-09는 **정식 출시(GA)** 별도 이벤트로 추가.
- Nano Banana 2 Lite는 "Lite" 변형 GA라 minor, Gemini Omni Flash(옴니 영상 생성)는 major.

## JSON Candidate
<json>
[
  {
    "date": "2026-07-01",
    "provider": "Google",
    "model": "Gemini Omni Flash",
    "event_type": "release",
    "summary_ko": "제미나이 옴니 플래시 프리뷰, 영상 생성",
    "summary_en": "Gemini Omni Flash preview, native video generation",
    "source_url": "https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-omni-flash-nano-banana-2-lite/",
    "source_type": "official_blog",
    "significance": "major",
    "category": "video"
  },
  {
    "date": "2026-07-01",
    "provider": "Google",
    "model": "Nano Banana 2 Lite",
    "event_type": "release",
    "summary_ko": "나노바나나 2 라이트 이미지 모델 GA",
    "summary_en": "Nano Banana 2 Lite image model reaches GA",
    "source_url": "https://cloud.google.com/blog/products/ai-machine-learning/nano-banana-2-lite-and-gemini-omni-flash-available",
    "source_type": "official_blog",
    "significance": "minor",
    "category": "image"
  },
  {
    "date": "2026-07-08",
    "provider": "xAI",
    "model": "Grok 4.5",
    "event_type": "release",
    "summary_ko": "Grok 4.5 공개, 커서 학습 코딩 모델",
    "summary_en": "Grok 4.5 released, Cursor-trained coding model",
    "source_url": "https://x.ai/news/grok-4-5",
    "source_type": "official_blog",
    "significance": "major",
    "category": "llm"
  },
  {
    "date": "2026-07-09",
    "provider": "OpenAI",
    "model": "GPT-5.6 Sol/Terra/Luna",
    "event_type": "release",
    "summary_ko": "GPT-5.6 Sol·Terra·Luna 정식 출시(GA)",
    "summary_en": "GPT-5.6 Sol, Terra, Luna reach general availability",
    "source_url": "https://openai.com/index/previewing-gpt-5-6-sol/",
    "source_type": "official_blog",
    "significance": "major",
    "category": "llm"
  },
  {
    "date": "2026-07-09",
    "provider": "Meta",
    "model": "Muse Spark 1.1",
    "event_type": "release",
    "summary_ko": "뮤즈 스파크 1.1, 메타 첫 유료 API",
    "summary_en": "Muse Spark 1.1, Meta's first paid agentic model API",
    "source_url": "https://ai.meta.com/blog/introducing-muse-spark-meta-model-api/",
    "source_type": "official_blog",
    "significance": "major",
    "category": "multimodal"
  },
  {
    "date": "2026-07-16",
    "provider": "Moonshot AI",
    "model": "Kimi K3",
    "event_type": "release",
    "summary_ko": "키미 K3 공개, 2.8조 오픈웨이트 MoE",
    "summary_en": "Kimi K3, 2.8T open-weight MoE, 1M context",
    "source_url": "https://www.marktechpost.com/2026/07/16/moonshot-ai-releases-kimi-k3-a-2-8-trillion-parameter-open-moe-model-with-kimi-delta-attention-and-1m-context/",
    "source_type": "news",
    "significance": "major",
    "category": "llm"
  }
]
</json>
