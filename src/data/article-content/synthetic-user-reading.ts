export const syntheticUserReadingContent = `## 요약

- 인터뷰 기록이나 설문 응답을 넣어주면 합성 유저의 응답이 실제 사람과 더 비슷해졌다는 연구들이 있다. 다만 특정 설문에서 얻은 결과를 다른 상황에 그대로 적용하기는 어렵다.
- 설문 응답을 재현하는 능력과 실제 행동을 예측하는 능력은 다르다. 화면에서 어디를 클릭할지 예측한 연구에서는 페르소나를 붙여도 정확도가 나아지지 않았다.
- 읽어본 자료를 바탕으로 보면, 합성 유저는 리서치 자료가 있는 분야에서 가설이나 질문을 미리 점검하는 데 쓸 수 있겠다. 응답을 실제 자료와 대조하는 절차는 필요하다.

---

가상 유저 패널(synthetic user panel)을 만들어 실무에 쓰면서, 이 패널의 답을 얼마나 믿어도 될지 궁금해졌다. 관련 연구와 강연을 찾아 읽고 AI와 함께 정리했다.

---

## 질문에 답하는 페르소나

델프트 공과대학의 [Gu, Chandrasegaran & Lloyd(2025)](https://doi.org/10.1017/S0890060424000283)는 실제 데이터를 바탕으로 하되 부족한 부분을 합성 데이터로 채운 페르소나를 **합성 유저(Synthetic User)**라고 부르자고 제안한다. 이 페르소나에 질문을 던지고 답을 받을 수 있다.

!["User research. Without the users."라는 문구를 내건 합성 유저 서비스의 랜딩 페이지](/assets/images/synthetic-user-reading-service-landing.webp "출처: [Synthetic Users: If Nothing Is Real, Everything Is Permitted](https://www.nngroup.com/articles/synthetic-users/) — Nielsen Norman Group, 2024")

[Salminen, Amin, Jung & Jansen(2025)](https://doi.org/10.1145/3745900.3746108)은 합성 유저가 확산되는 배경으로 개인정보 규제, 리서치 성과를 수치로 증명하기 어려운 사정, 참여자 모집 비용을 든다.

![회의 테이블에 앉은 세 사람 맞은편에, 화면과 휴대폰에서 홀로그램처럼 떠오른 네 명의 가상 참여자가 대화에 참여하고 있는 일러스트](/assets/images/synthetic-user-reading-panel-interview.webp "실제 참여자를 모집하는 대신 합성 유저를 인터뷰 자리에 앉히는 그림 (AI 생성)")

---

## 리서치 데이터 없이 만든 합성 유저의 문제

실제 참여자의 자료 없이 만든 합성 유저는 특정인의 경험을 재현하는지 확인하기 어렵다. 학습 데이터에서 익숙한 패턴을 가져와 일반적인 유저 묘사를 내놓을 수 있다. 문장이 자연스러우면 그런 답도 실제 경험처럼 읽힌다. Salminen 등(2025)은 이처럼 그럴듯하지만 사실과 다른 모방을 위험으로 꼽는다.

Nielsen Norman Group의 [Rosala & Moran(2024)](https://www.nngroup.com/articles/synthetic-users/)은 실무에서 생기는 문제를 짚는다. 합성 유저는 상대를 만족시키려는 성향 때문에 실제보다 우호적으로 답하고, 여러 요구를 모두 중요하다고 해 우선순위를 가리기 어렵게 만든다. 답변만으로는 실제 행동을 관찰한 자료를 얻을 수도 없다. 학습에 쓰인 인터넷 데이터에 어떤 편향이 섞여 있는지도 확인하기 어렵다.

---

## 인터뷰와 설문 자료를 넣었을 때

인터뷰 기록이나 상세한 프로필을 넣어 응답의 정확도를 높이려는 연구들이 있다. 나이나 직업 같은 속성뿐 아니라 그 사람이 자신의 경험을 어떻게 설명하는지도 담는다.

[Kang 등(2025)](https://arxiv.org/abs/2504.11673)의 Deep Binding은 여러 차례 진행한 인터뷰 기록을 페르소나의 배경 이야기로 넣는다. 사람이 자신의 삶을 이야기로 구성하며 정체성을 형성한다는 서사 정체성 이론을 설계에 적용했다. 정치 성향 설문에서는 합성 응답과 실제 응답의 분포 차이가 Wasserstein 거리 기준으로 87% 줄었다고 보고한다.

[DeepPersona(2025)](https://arxiv.org/abs/2511.07338)는 페르소나 하나에 정리된 속성 수백 개와 1MB 남짓의 설명 글을 함께 담는다. 저자들은 기존 방식보다 속성 다양성이 32%, 프로필 고유성이 44% 나아졌고, 사회 조사에서 합성 응답과 실제 응답의 차이가 31.7% 줄었다고 보고한다.

![DeepPersona의 두 단계 파이프라인 도식. 왼쪽은 자기 공개형 문답에서 속성을 뽑아내는 과정, 가운데는 뽑은 속성을 걸러 인간 속성 트리로 병합하는 과정, 오른쪽은 그 트리에서 값을 채워 서술형 프로필을 만들어내는 과정](/assets/images/synthetic-user-reading-deeppersona-pipeline.webp "출처: [DeepPersona: A Generative Engine for Scaling Deep Synthetic Personas](https://arxiv.org/abs/2511.07338) — 2025, Figure 2")

설문 응답의 일치율로 정확도를 잴 때는 비교 대상인 사람의 답도 달라질 수 있다는 점을 고려해야 한다.

[Park 등(2024)](https://arxiv.org/abs/2411.10109)은 미국 성인 1,052명에게 2시간짜리 인터뷰와 설문(General Social Survey, Big Five)을 진행했다. 2주 뒤 같은 설문을 반복해 참가자의 두 응답이 얼마나 일치하는지 쟀고, 1차 자료로 만든 에이전트에게도 같은 문항을 물었다.

General Social Survey 문항에서 참가자의 두 응답이 일치한 비율은 79.53%, 인터뷰 기록으로 만든 에이전트가 참가자의 응답을 맞힌 비율은 65.67%였다. 사람의 응답도 약 20%는 달라진 셈이다. Big Five에서는 1차와 2차 응답의 상관계수가 0.95였다.

저자들은 이런 재검사 결과를 반영해 에이전트의 정확도를 보정한다. GSS에서는 에이전트의 일치율을 사람의 자기 일치율로 나눈다. 65.67%를 79.53%로 나누면 정규화 정확도는 약 0.83이다. 이 수치는 에이전트가 사람의 답을 83% 맞혔다는 뜻은 아니다.

[Romberg 등(2026)](https://arxiv.org/abs/2608.22582)의 하이브리드 패널은 사람 응답자와 LLM을 함께 두고 자료를 계속 모은다. 조사를 반복할 때마다 양쪽 답이 어긋난 지점을 찾아 모델을 고친다. LLM이 만든 응답을 사람이 검토하는 절차도 둔다.

---

## 설문 응답을 맞혀도 행동 예측은 어렵다

[Anand(2026)](https://www.youtube.com/watch?v=YnNF55QV0zs)는 강연에서 합성 패널을 일기예보에 빗댄다. 예보의 적용 범위를 확인하듯, 합성 페르소나도 학습한 자료가 어떤 상황을 다루는지 확인해야 한다는 설명이다.

![합성 페르소나를 일기예보에 빗대 열네 가지 원칙으로 비교한 강연 슬라이드](/assets/images/synthetic-user-reading-weather-forecast-personas.webp "출처: [Persona Engineering: A Field Guide to AI Synthetic Personas](https://www.youtube.com/watch?v=YnNF55QV0zs) — Ishan Anand, AI Engineer World's Fair 2026 (2026.07.01)")

강연에서 인용한 Hewitt 등의 연구는 LLM으로 실험 결과를 예측했다. 설문으로 태도(attitude)를 묻는 실험보다 실제 행동(behavior)을 관찰하는 현장 실험에서 예측 정확도가 낮았다. Anand는 LLM이 학습한 사람들의 말과 실제 행동 사이에 차이가 있다는 점을 짚는다.

![태도 예측은 행동 예측보다 쉽다는 것을 실험별로 비교한 강연 슬라이드](/assets/images/synthetic-user-reading-attitudes-vs-actions.webp "출처: [Persona Engineering: A Field Guide to AI Synthetic Personas](https://www.youtube.com/watch?v=YnNF55QV0zs) — Ishan Anand, AI Engineer World's Fair 2026 (2026.07.01)")

[Kuric, Demcak & Krajcovic(2026)](https://arxiv.org/abs/2605.18302)은 실제 UX 리서치의 퍼스트 클릭 테스트 12건(참가자 3,431명)으로 GPT의 행동 예측을 검증했다. 사람들이 화면의 어디를 클릭할지 예측하게 했는데, 전체 과제의 53%에서 합성 응답의 클릭 분포가 실제와 통계적으로 유의하게 달랐다. 페르소나 부여, 단계별 추론, 샘플링 값 조정으로도 정확도가 나아지지 않았다.

![합성 응답과 실제 응답을 의미 다양성·단어 반복·읽기 쉬움·길이 네 가지로 비교한 상자그림](/assets/images/synthetic-user-reading-synthetic-vs-real-answers.webp "출처: [What Would GPT Click: Practical Effects of Human-AI Behavioral Misalignment and the Cost of Synthetic Participants in User Experience](https://arxiv.org/abs/2605.18302) — Kuric, Demcak & Krajcovic, 2026, Figure 5")

---

## 합성 유저를 쓸 때 확인할 것

Deep Binding과 Park 등의 연구에서 응답을 재현하는 데 쓴 자료는 실제 사람의 인터뷰와 설문이었다. 그 자료를 확보하고, 합성 응답이 얼마나 비슷한지 확인하는 데도 사람 대상 조사가 필요했다. 이 결과를 근거로 사람 대상 리서치를 생략하기는 어렵다.

실무에서 합성 패널을 쓸 때는 다음을 확인하려 한다.

- 다루려는 분야에 인터뷰나 설문 등 실제 사람에게서 얻은 자료가 충분히 있는가.
- 합성 응답을 바탕으로 세운 가설이나 다듬은 질문을 실제 리서치에서 확인할 수 있는가.
- 합성 응답을 실제 자료와 대조하고, 어긋났을 때 수정하는 절차가 있는가.

![책상에 둘러앉은 두 사람이 화면을 함께 보며, 주위에 떠 있는 여러 합성 페르소나 카드의 답을 자료와 견줘보는 일러스트](/assets/images/synthetic-user-reading-probing-answers.webp "합성 유저의 답을 그대로 받아들이지 않고 계속 되묻고 테스트해보는 방식으로 쓸 것 (AI 생성)")

---

## 참고 문헌

- [Gu, Chandrasegaran & Lloyd, "Synthetic users: insights from designers' interactions with persona-based chatbots"](https://doi.org/10.1017/S0890060424000283) — AI EDAM, 2025. 합성 유저 개념을 제안한 논문
- [Salminen, Amin, Jung & Jansen, "The Use of Large Language Models in HCI: A Critical Analysis of Synthetic Users"](https://doi.org/10.1145/3745900.3746108) — Augmented Humans, 2025. 합성 유저가 확산되는 배경, 그에 따르는 위험, 사용 가능한 조건과 그렇지 않은 조건
- [Park et al., "LLM Agents Grounded in Self-Reports Enable General-Purpose Simulation of Individuals"](https://arxiv.org/abs/2411.10109) — 2024. 미국 성인 1,052명을 2주 뒤 재조사해 사람 쪽 노이즈를 먼저 잰 연구. GSS 기준 참가자 자기 일치율 79.53%, 인터뷰 기반 에이전트 원 정확도 65.67%, 정규화 정확도 0.83
- [Romberg et al., "Hybrid Panels: Toward Human-AI Collaboration in Survey Research"](https://arxiv.org/abs/2608.22582) — 2026. 사람 패널과 LLM을 같은 조사 안에 두고 조사 차수마다 보정하는 설계. 독일 1,201명 파일럿, 참여 의향 83% 대 69%
- [Kuric, Demcak & Krajcovic, "What Would GPT Click: Practical Effects of Human-AI Behavioral Misalignment and the Cost of Synthetic Participants in User Experience"](https://arxiv.org/abs/2605.18302) — 2026. 실무 퍼스트 클릭 테스트 12건(3,431명)으로 GPT의 클릭 예측을 검증. 과제의 53%에서 분포가 유의하게 달랐고, 페르소나·단계별 추론·샘플링 조정 모두 개선 효과 없음
- [Kang et al., "Deep Binding of Language Model Virtual Personas"](https://arxiv.org/abs/2504.11673) — 2025. 인터뷰 전사록을 배경 서사로 부여해 정치 성향 설문의 응답 분포 재현을 개선(Wasserstein 거리 기준 87%)
- [DeepPersona: A Generative Engine for Scaling Deep Synthetic Personas](https://arxiv.org/abs/2511.07338) — 2025. 수백 개의 구조화된 속성과 1MB 규모의 서술형 텍스트를 함께 쓰는 페르소나
- [Rosala & Moran, "Synthetic Users: If Nothing Is Real, Everything Is Permitted"](https://www.nngroup.com/articles/synthetic-users/) — Nielsen Norman Group, 2024. 실무 관점의 회의론. 비위 맞추기와 과도한 낙관, 우선순위 부재, 행동 데이터의 부재를 지적하고 허용 가능한 용도를 제한
- [Anand, "Persona Engineering: A Field Guide to AI Synthetic Personas"](https://www.youtube.com/watch?v=YnNF55QV0zs) — AI Engineer World's Fair, 2026. 일기예보 비유, 태도와 행동의 간극

`
