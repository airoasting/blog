# Anthropic의 Mythos, AI가 제로데이를 사냥합니다

**날짜**: 2026-04-07  
**카테고리**: 기술  
**출처**: The New York Times  
**원문**: https://www.nytimes.com/2026/04/07/technology/anthropic-claims-its-new-ai-model-mythos-is-a-cybersecurity-reckoning.html  
**태그**: Anthropic, 사이버보안, ClaudeMythos, AI보안

---

## 3줄 요약

- Anthropic이 Claude Mythos Preview를 Amazon, Google, Microsoft 등 12개 파트너에만 제한 배포했습니다.
- 이 모델은 수천 개의 제로데이 취약점을 발견하고 Linux 커널 결함을 자율적으로 체이닝합니다.
- 사이버범죄자 악용 우려로 공개 출시를 보류했지만, 공격자도 유사 시스템을 개발하고 있습니다.

---

## Roasting

Anthropic이 AI 해커를 만들었습니다. 공개하지 않기로 했다는 이유만으로 안심하고 있습니까?

---

## 이 글, 왜 읽어야 하나

수천 개의 제로데이 취약점을 발견하는 AI가 만들어졌습니다. Anthropic은 이 모델을 일반에 공개하지 않기로 했습니다. 보안팀장 Logan Graham은 "일반 공개하기 편하지 않았다"고 밝혔습니다(NYT, 2026). 문제는 비슷한 시스템을 다른 행위자도 개발하고 있다는 점입니다.

---

## 왜 지금 중요한가

AI가 코드를 작성하는 단계를 넘어 취약점을 자율적으로 탐색하는 단계에 진입했습니다. Anthropic은 Claude Mythos Preview를 Project Glasswing 이니셔티브를 통해 배포했습니다. 12개 파트너에만 제한됐습니다. Amazon, Apple, Cisco, Google, JPMorgan Chase, Microsoft, Broadcom, Nvidia, Linux Foundation, CrowdStrike, Palo Alto Networks가 포함됩니다.

---

## 핵심 인사이트

**첫째, 제로데이를 자율적으로 발견하고 체이닝합니다.** Claude Mythos Preview는 수천 개의 제로데이 취약점을 발견했습니다. Linux 커널 결함을 자율적으로 체이닝해 완전한 시스템 장악이 가능합니다. "극도로 자율적"이라는 표현이 Anthropic 내부 문서에 사용됐습니다(NYT, 2026).

**둘째, 인간 해커를 속도와 지속성에서 압도합니다.** AI는 수백 명의 인간 해커보다 빠르고 지속적으로 취약점을 스캔합니다. 피로 없이, 24시간, 여러 시스템을 동시에 분석합니다.

**셋째, 공격자와 방어자 간 AI 격차가 벌어집니다.** 12개 파트너는 방어 목적 사용을 전제로 접근권을 받았습니다. 방어 측만 이 도구를 활용하는 시간이 제한적입니다.

---

## 내일 당장 할 수 있는 것

1. **핵심 시스템 취약점 현황을 파악합니다.** Claude에 "우리 시스템의 공개된 CVE 목록에서 우선순위 취약점 5개를 정리해줘"라고 요청합니다. (1시간)
2. **AI 기반 보안 도구 도입 가능성을 검토합니다.** CrowdStrike, Palo Alto Networks 솔루션을 비교합니다. (1주)
3. **보안팀 AI 위협 인식 교육을 계획합니다.** 분기별 인식 교육 계획을 수립합니다. (반나절)

---

## 리스크 & 주의점

- 공개 보류는 안심 이유가 되지 않습니다. 유사 기술이 다른 경로로 확산될 수 있습니다.
- 방어 목적과 공격 목적의 경계가 흐립니다. 사용 목적 통제가 기술 통제보다 중요합니다.
- 책임 구조가 불명확합니다. 사용 범위와 책임 경계를 계약에 명시해야 합니다.

---

## 한 줄 정리

AI가 취약점을 찾는 속도가 사람이 패치하는 속도를 앞지르고 있습니다. 방어 측도 같은 도구를 써야 합니다.

---

## 리더의 결정 포인트

- **CISO**: AI 기반 취약점 스캔 도구를 보안 체계에 선제적으로 통합하라.
- **CEO**: 파트너사 보안 수준을 공급망 리스크 기준으로 평가하라.
- **팀장**: 핵심 시스템 접근 권한 목록을 분기별로 재검토하라.

---

## 참고자료

The New York Times. (2026, 4월). *Anthropic Claims Its New A.I. Model, Mythos, Is a Cybersecurity Reckoning* [Article]. The New York Times. https://www.nytimes.com/2026/04/07/technology/anthropic-claims-its-new-ai-model-mythos-is-a-cybersecurity-reckoning.html
