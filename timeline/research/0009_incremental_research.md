# AI Model Timeline Research

- Research date: 2026-09-16
- Coverage start: 2026-07-26
- Coverage end: 2026-09-16
- Run type: incremental
- Sources checked: 공식 블로그 8건, 뉴스 9건

## Scope
- OpenAI, Anthropic, Google, Meta, xAI, DeepSeek, Z.ai, Alibaba (페이지 providerOrder 기준)

## New or Updated Events
| Date | Provider | Model | Event Type | Significance | Source 1 |
|---|---|---|---|---|---|
| 2026-08-03 | Alibaba | Qwen3.8-Max | release | major | https://www.alibabagroup.com/en-US/document-2021044032125272064 |
| 2026-08-05 | Meta | Muse Spark 1.2 | release | minor | https://en.wikipedia.org/wiki/Muse_Spark |
| 2026-08-10 | Meta | Muse Glimmer | release | major | https://www.constellationr.com/insights/news/meta-releases-open-weight-muse-glimmer-model-open-muse-spark-12-tap |
| 2026-08-12 | xAI | Grok 4.6 | release | major | https://llm-stats.com/blog/research/grok-4.6-launch |
| 2026-08-13 | Google | Gemini 3.7 Flash | release | minor | https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/ |
| 2026-08-14 | Z.ai | GLM-5.3 | release | major | https://z.ai/blog/glm-5.3 |
| 2026-09-01 | Anthropic | Fable 5.1 / Mythos 5.1 | release | major | https://www.anthropic.com/claude-fable-and-mythos-5-1 |
| 2026-09-02 | Google | Gemini 3.8 Flash | release | major | https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/ |
| 2026-09-03 | OpenAI | GPT-6 Astra | release | major | https://openai.com/index/gpt-6-astra/ |
| 2026-09-10 | DeepSeek | DeepSeek-V4.1-Flash | release | major | https://api-docs.deepseek.com/news/news260910/ |

| 2026-08-18 | LG | K-EXAONE 2.0 | release | minor | https://en.sedaily.com/finance/2026/08/18/k-exaone-advances-to-third-phase-of-koreas-homegrown-ai |
| 2026-08-31 | Mistral | Mistral OCR 4.1 | release | minor | https://docs.mistral.ai/resources/changelogs |

## Notes
- 날짜는 공식 게시일(Alibaba, Google 블로그 직접 확인)과 TechCrunch·Axios·CNBC 보도로 교차 확인했습니다.
- Grok 4.6, Muse Spark 1.2/Glimmer는 공식 페이지 직접 확인 불가, 복수 언론 보도로 확인했습니다.
- Mistral, ByteDance, Moonshot AI, LG 추가 조사. Kimi K2.8 Preview는 단일 출처(공식 모델 목록 미등재)라 제외. ByteDance는 신규 모델 없음(Doubao Work는 에이전트 제품).
- 제외: GPT-5.6-Cyber(제한 접근), Tencent Hy-MT2 등 providerOrder 밖 회사.

## JSON Candidate
```json
[
  {
    "date": "2026-08-18",
    "provider": "LG",
    "model": "K-EXAONE 2.0",
    "event_type": "release",
    "summary_ko": "K-EXAONE 2.0 공개, 독자 AI 3단계 진출",
    "summary_en": "K-EXAONE 2.0 unveiled, advances to phase three",
    "source_url": "https://en.sedaily.com/finance/2026/08/18/k-exaone-advances-to-third-phase-of-koreas-homegrown-ai",
    "source_type": "news",
    "significance": "minor",
    "category": "llm"
  },
  {
    "date": "2026-08-31",
    "provider": "Mistral",
    "model": "Mistral OCR 4.1",
    "event_type": "release",
    "summary_ko": "Mistral OCR 4.1 정식 출시(GA)",
    "summary_en": "Mistral OCR 4.1 generally available",
    "source_url": "https://docs.mistral.ai/resources/changelogs",
    "source_type": "official_blog",
    "significance": "minor",
    "category": "multimodal"
  },

  {
    "date": "2026-08-03",
    "provider": "Alibaba",
    "model": "Qwen3.8-Max",
    "event_type": "release",
    "summary_ko": "Qwen3.8-Max 공개, 2.4조 파라미터 플래그십",
    "summary_en": "Qwen3.8-Max, 2.4T-parameter flagship",
    "source_url": "https://www.alibabagroup.com/en-US/document-2021044032125272064",
    "source_type": "official_blog",
    "significance": "major",
    "category": "multimodal"
  },
  {
    "date": "2026-08-05",
    "provider": "Meta",
    "model": "Muse Spark 1.2",
    "event_type": "release",
    "summary_ko": "뮤즈 스파크 1.2 출시, 오픈웨이트 예고",
    "summary_en": "Muse Spark 1.2 launched, open weights promised",
    "source_url": "https://en.wikipedia.org/wiki/Muse_Spark",
    "source_type": "news",
    "significance": "minor",
    "category": "multimodal"
  },
  {
    "date": "2026-08-10",
    "provider": "Meta",
    "model": "Muse Glimmer",
    "event_type": "release",
    "summary_ko": "뮤즈 글리머 30B 오픈웨이트 공개",
    "summary_en": "Muse Glimmer 30B open weights, Apache 2.0",
    "source_url": "https://www.constellationr.com/insights/news/meta-releases-open-weight-muse-glimmer-model-open-muse-spark-12-tap",
    "source_type": "news",
    "significance": "major",
    "category": "llm"
  },
  {
    "date": "2026-08-12",
    "provider": "xAI",
    "model": "Grok 4.6",
    "event_type": "release",
    "summary_ko": "Grok 4.6 공개, 장기 에이전트 강화",
    "summary_en": "Grok 4.6, stronger long-running agents",
    "source_url": "https://llm-stats.com/blog/research/grok-4.6-launch",
    "source_type": "news",
    "significance": "major",
    "category": "llm"
  },
  {
    "date": "2026-08-13",
    "provider": "Google",
    "model": "Gemini 3.7 Flash",
    "event_type": "release",
    "summary_ko": "제미나이 3.7 플래시, 코딩·에이전트 강화",
    "summary_en": "Gemini 3.7 Flash for coding and agents",
    "source_url": "https://blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-3-7-flash/",
    "source_type": "official_blog",
    "significance": "minor",
    "category": "llm"
  },
  {
    "date": "2026-08-14",
    "provider": "Z.ai",
    "model": "GLM-5.3",
    "event_type": "release",
    "summary_ko": "GLM-5.3 공개, 사후학습으로 코딩 강화",
    "summary_en": "GLM-5.3, post-training gains in coding",
    "source_url": "https://z.ai/blog/glm-5.3",
    "source_type": "official_blog",
    "significance": "major",
    "category": "code"
  },
  {
    "date": "2026-09-01",
    "provider": "Anthropic",
    "model": "Fable 5.1 / Mythos 5.1",
    "event_type": "release",
    "summary_ko": "Claude Fable 5.1·Mythos 5.1 출시",
    "summary_en": "Claude Fable 5.1 and Mythos 5.1 released",
    "source_url": "https://www.anthropic.com/claude-fable-and-mythos-5-1",
    "source_type": "official_blog",
    "significance": "major",
    "category": "llm"
  },
  {
    "date": "2026-09-02",
    "provider": "Google",
    "model": "Gemini 3.8 Flash",
    "event_type": "release",
    "summary_ko": "제미나이 3.8 플래시·플래시 사이버 공개",
    "summary_en": "Gemini 3.8 Flash and 3.8 Flash Cyber",
    "source_url": "https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/",
    "source_type": "official_blog",
    "significance": "major",
    "category": "llm"
  },
  {
    "date": "2026-09-03",
    "provider": "OpenAI",
    "model": "GPT-6 Astra",
    "event_type": "release",
    "summary_ko": "GPT-6 Astra 출시, 사이버 역량 Critical 첫 도달",
    "summary_en": "GPT-6 Astra, first Critical-level cyber model",
    "source_url": "https://openai.com/index/gpt-6-astra/",
    "source_type": "official_blog",
    "significance": "major",
    "category": "llm"
  },
  {
    "date": "2026-09-10",
    "provider": "DeepSeek",
    "model": "DeepSeek-V4.1-Flash",
    "event_type": "release",
    "summary_ko": "V4.1-Flash 공개, 네이티브 멀티모달 MoE",
    "summary_en": "V4.1-Flash, native multimodal MoE, 1M context",
    "source_url": "https://api-docs.deepseek.com/news/news260910/",
    "source_type": "official_blog",
    "significance": "major",
    "category": "multimodal"
  }
]
```
