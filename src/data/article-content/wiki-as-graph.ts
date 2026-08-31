export const wikiAsGraphContent = `## 요약

- 합성 유저(synthetic user)가 사람을 대상으로 하는 유저 리서치를 대신할 수 있을까. 이 글은 그 질문을 놓고 최근 나온 연구와 강연을 읽어 정리한 글이다.
- 합성 유저가 실제 사람과 유사하게 만들었다는 연구들은 실제 사람에 대한 자료를 먼저 확보하고, 이 자료를 사용했다. 긴 인터뷰 기록이나 설문 응답 같은 것들이다. 그런 자료가 없는 분야라면 합성 유저를 실제 사람처럼 만들기 어렵다.
- 지금까지 나온 연구들은 대부분 합성 유저가 실제 사람을 대체하기에는 무리가 있다는 입장이다. 다만 이미 실제 사람 기반으로한 리서치 자료가 많이 쌓인 분야에서 가설을 미리 점검하거나 질문을 다듬는 보조 도구로는 쓸 만하다고 본다.

---

[가상 유저 패널](/article/synthetic-user-research-panel)을 직접 만들어 실무에 쓰면서 합성 패널에 대한 관심도가 자연스럽게 올라가게 되었다. 그래서 관련 연구와 강연을 찾아 읽었고, 이 글은 그 내용을 AI와 함께 정리한 기록이다.

---

## 우선 합성 유저란 무엇인가

델프트 공과대학의 [Gu, Chandrasegaran & Lloyd(2025)](https://doi.org/10.1017/S0890060424000283)는 실제 데이터를 바탕으로 하되 부족한 부분을 합성 데이터로 채운 페르소나를 **합성 유저(Synthetic User)**라고 부르자고 제안한다. 기존 페르소나가 읽기만 하는 정적인 문서였다면, 합성 유저는 질문을 던지면 답을 하는 대화 상대가 될 수 있는 가상 유저이다.

!["User research. Without the users."라는 문구를 내건 합성 유저 서비스의 랜딩 페이지](/assets/images/wiki-as-graph-synthetic-users-landing.webp "출처: [Synthetic Users: If Nothing Is Real, Everything Is Permitted](https://www.nngroup.com/articles/synthetic-users/) — Nielsen Norman Group, 2024")

[Salminen, Amin, Jung & Jansen(2025)](https://doi.org/10.1145/3745900.3746108)에 의하면 현업에서 합성 유저의 도입은 늘어나는 추세라고 한다. 대표적으로 개인정보 규제 때문에 실제 유저를 만나기 어려워진 케이스도 있고, 유저 리서치가 얼마나 성과를 냈는지는 숫자로 증명해내기 어려운 부분도 있고, 아무래도 실제 사람 참여자 모집하기 위해서는 돈이 드는데 조직은 돈이 덜 드는 가상 유저를 사용하는 쪽을 고르게 되기 때문이다.

---

## 실제 사람과 더 비슷하게 만들려는 시도

합성 유저를 실제 사람에 더 가깝게 만들려는 연구는 꾸준히 나오고 있다. 방향은 대체로 비슷한데, 나이나 직업 같은 속성을 목록으로 늘어놓는 대신 그 사람에 대한 이야기를 길게 넣어주는 쪽이다.

[Kang 등(2025)](https://arxiv.org/abs/2504.11673)의 Deep Binding이 그렇다. 속성을 나열하는 대신 여러 번에 걸쳐 진행한 인터뷰 기록을 그대로 배경 이야기로 넣어준다. 사람의 성격은 자기 이야기를 통해 만들어진다는 이론(서사 정체성)을 설계에 가져온 것이다. 저자들은 정치 성향 설문에서 응답 분포를 얼마나 비슷하게 맞추는지가 87% 나아졌다고 보고한다.

[DeepPersona(2025)](https://arxiv.org/abs/2511.07338)는 두 방식을 같이 쓴다. 페르소나 하나에 정리된 속성 수백 개와 1MB 남짓의 설명 글을 함께 담는다. 기존 방식보다 속성 다양성이 32%, 프로필 고유성이 44% 나아졌고, 사회 조사에서 흉내낸 응답과 실제 응답의 차이를 31.7% 줄였다고 한다.

---

## 사람의 답도 100% 일관되게 나오지 않는다

정확도가 높아졌다는 말은 결국 사람의 답에 더 가까워졌다는 뜻이다. 재는 방법도 비슷하다. 실제로 했던 설문을 페르소나에게 똑같이 물어보고 답이 얼마나 겹치는지 세는 것이다. 그런데 이 방법은 채점 기준이 되는 사람의 답이 안정적이라고 전제한다. 그 전제부터 확인한 연구가 있다.

[Park 등(2024)](https://arxiv.org/abs/2411.10109)은 미국 성인 1,052명에게 2시간짜리 인터뷰와 설문(General Social Survey, Big Five)을 진행했다. 그리고 2주 뒤 같은 설문을 한 번 더 해서, 같은 사람이 2주 전 자기 답을 얼마나 지키는지부터 쟀다. 1차 데이터로 만든 에이전트에게도 같은 문항을 물었다.

General Social Survey에서 참가자가 2주 뒤 자기 답을 그대로 지킨 비율은 79.53%였다. 인터뷰 기록으로 만든 에이전트가 참가자의 답을 맞힌 비율은 65.67%였다. 뒤쪽을 앞쪽으로 나눈 0.83이 이 연구가 말하는 정규화 정확도다. 같은 방식으로 계산하면 설문만 쓴 에이전트는 0.82, 둘을 합치면 0.86, 인구통계 정보만 준 경우는 0.74, 흔한 페르소나 설명만 준 경우는 0.71이었다.

같은 사람에게 같은 걸 물어도 2주 만에 답의 20%가 바뀐다는 이야기다. 흔들리는 정도는 문항에 따라 다르다. Big Five에서는 1차와 2차 응답의 상관이 0.95로 훨씬 안정적이었고, 그만큼 넘어야 할 기준선도 높아졌다. 사람의 답을 정답지로 쓰려면 그 정답지가 얼마나 흔들리는 문항인지도 같이 봐야 한다.

사람 데이터를 계속 모으는 쪽으로 설계한 연구도 있다. [Romberg 등(2026)](https://arxiv.org/abs/2608.22582)의 하이브리드 패널은 한 패널 안에 사람 응답자와 LLM을 같이 두고, 조사를 한 차례 돌 때마다 양쪽 답이 어긋난 지점을 찾아 다음 차례에 모델을 고친다. LLM이 대신 만든 응답이 말이 되는지 사람이 검토하는 절차도 들어 있다.

다만 이 설계에는 대가가 있다. 독일 거주자 1,201명을 대상으로 한 사전 조사에서 일반 패널에는 83%가 참여하겠다고 답했지만 하이브리드 패널에는 69%만 그렇게 답했다. 참여하겠다고 한 쪽은 AI에 더 우호적이고, 정치 성향이 상대적으로 우측이었으며, 남성 비율이 높았다. 페르소나가 얼마나 정확한지 따지기 전에 누가 패널에 남는지부터 한쪽으로 쏠린다.

---

## 합성 유저, 실제로 써보면 어떤가

그래서 현장에서 쓰면 뭐가 달라질까. 앞서 개념을 제안한 Gu 등(2025)이 같은 논문에서 이걸 직접 실험했다. 디자이너 20명을 두 그룹으로 나눠 같은 페르소나를 주되, 한쪽에는 예전처럼 문서 요약으로, 다른 쪽에는 대화가 되는 챗봇으로 줬다.

아이디어 개수는 차이가 없었다. 양쪽 다 137개였고 주제 다양성도 비슷했다. 차이는 "이 사람은 실제 인물 같다"는 문항에서 나왔다. 문서 조건의 중앙값은 6.0인데 챗봇 조건은 3.0이었다. 같은 정보를 대화로 주고받게 했더니 오히려 사람 같지 않다고 느낀 것이다.

과정은 달랐다. 챗봇 조건의 디자이너들은 자기 아이디어를 페르소나에게 말해보고 반응을 물었다. 문서로는 할 수 없는 일이다. 한 디자이너가 반려동물을 묻자 챗봇은 고양이를 기른다고 답했고, 출장이 잦다는 설정과 엮이면서 앱으로 조작하는 자동 급식기라는 아이디어가 나왔다.

 문서 형태의 페르소나를 접한 디자이너는 아이디어를 더 매끄럽게 냈지만 소재가 떨어지면 거기서 멈췄다. 반면 챗봇 형태의 합성 페르소나를 접한 디자이너들은 주어진 태스크와 다르게 쓰는 경우가 잦았고, 그 딴짓이 오히려 계속 캐물어보게 만들어 독특한 아이디어로 이어졌다. 대신 정보를 캐는 분석적 사고와 아이디어를 만드는 창의적 사고를 계속 오가야 하기 때문에 머리를 더 쓰게 된다는 단점이 있다. 저자들은 이렇게 인지 부하(cognitive load)가 커지면 창의적 성과가 떨어진다는 선행 연구(Redifer 등, 2019)를 근거로, 챗봇 조건에서 아이디어가 덜 매끄럽게 나온 이유를 설명한다.

그래서 저자들은 합성 유저를 참여 디자인(participatory design)의 방법을 빌려서 같이 일하는 이해관계자에 가깝게 다루자고 제안한다. 이 실험에서 합성 유저가 늘려준 건 아이디어의 양이 아니라 참여 디자이너들이 계속 되묻고 시험해보는 과정이었다.

---

## 언제 써도 되고 언제 안 되는가

Salminen 등(2025)은 아직 잠정적인 안이라고 밝히면서 다음과 같은 기준을 내놓는다.

~~~
[ 합성 유저를 언제 쓸 것인가 ]

  ─ 사용을 고려할 수 있는 경우 ──────────────
     · 이미 잘 알려진 제품
     · 요구사항 또한 이미 알려져 있고
     · 리서치 계획과 예상 응답을 미리 점검하는 용도
     · 비교적 동질적인 유저 집단

  ─ 사용해서는 안 되는 경우 ─────────────────
     · 소수자나 주변화된 집단
     · 새로운 제품이나 서비스
     · 요구사항과 사용 맥락을 예측하기 어려울 때
     · 실제 사람 대상 리서치를 대체하려는 목적
~~~

LLM은 학습한 데이터에 있는 패턴을 조합하는 도구라서 주어진 데이터 그 바깥의 이야기는 잘 만들지 못한다. 나오는 건 누군가의 구체적인 경험이 아니라 어디서 본 듯한 일반적인 유저 묘사다. 그렇기 때문에 완전히 새로운 사용성 문제나 미처 몰랐던 니즈를 찾는 데는 쓸 수 없다는 뜻이다.

[Anand(2026)](https://www.youtube.com/watch?v=YnNF55QV0zs)의 강연은 같은 한계를 일기예보에 빗대 설명한다. 일기예보는 정해진 조건 안에서는 잘 맞지만 그 범위를 벗어나면 틀린다. 합성 페르소나도 학습한 데이터가 닿는 범위 안에서만 쓸 만하다는 것이다.

![합성 페르소나를 일기예보에 빗대 열네 가지 원칙으로 비교한 강연 슬라이드](/assets/images/wiki-as-graph-weather-forecast-personas.webp "출처: [Persona Engineering: A Field Guide to AI Synthetic Personas](https://www.youtube.com/watch?v=YnNF55QV0zs) — Ishan Anand, AI Engineer World's Fair 2026 (2026.07.01)")

그가 짚는 실패 지점 중 하나는 말과 행동의 차이다. LLM이 배운 건 사람들이 한 말이지 실제로 한 행동이 아니다. 그래서 말로 드러나는 태도는 어느 정도 흉내내도 실제 선택은 잘 못 맞힌다. 강연은 LLM으로 예측한 Hewitt 등의 연구를 인용해 이를 보여준다. 설문으로 태도(attitude)를 묻는 실험에서는 예측이 제법 맞지만, 실제 행동(behavior)을 관찰하는 현장 실험에서는 정확도가 눈에 띄게 떨어진다.

![태도 예측은 행동 예측보다 쉽다는 것을 실험별로 비교한 강연 슬라이드](/assets/images/wiki-as-graph-attitudes-vs-actions.webp "출처: [Persona Engineering: A Field Guide to AI Synthetic Personas](https://www.youtube.com/watch?v=YnNF55QV0zs) — Ishan Anand, AI Engineer World's Fair 2026 (2026.07.01)")

[Kuric, Demcak & Krajcovic(2026)](https://arxiv.org/abs/2605.18302)은 이 문제를 실무 데이터로 확인했다. 실제 UX 리서치에서 진행된 퍼스트 클릭 테스트 12건(참가자 3,431명)을 가져와, 사람들이 화면 어디를 클릭하는지 GPT가 맞힐 수 있는지 본 것이다. 전체 과제의 53%에서 합성 응답의 클릭 분포가 실제와 뚜렷하게 달랐다. 페르소나를 붙이거나 생각의 과정을 단계별로 쓰게 하거나 샘플링 값을 조정해도 정확도는 나아지지 않았고, 답이 그럴듯해 보이기만 했다.

![합성 응답과 실제 응답을 의미 다양성·단어 반복·읽기 쉬움·길이 네 가지로 비교한 상자그림](/assets/images/wiki-as-graph-synthetic-vs-real-answers.webp "출처: [What Would GPT Click: Practical Effects of Human-AI Behavioral Misalignment and the Cost of Synthetic Participants in User Experience](https://arxiv.org/abs/2605.18302) — Kuric, Demcak & Krajcovic, 2026, Figure 5")

Salminen 등(2025)은 위험을 두 가지 더 짚는다. 하나는 그럴듯한 모방이다. 합성 유저는 말을 워낙 잘해서 내용이 부실해도 오히려 더 믿음직해 보인다. '그럴듯한 모방'에 대한 우려점을 Nielsen Norman Group의 [Rosala & Moran(2024)](https://www.nngroup.com/articles/synthetic-users/)도 언급한다. 저자들이 허용하는 용도는 잘 모르는 유저 집단에 대한 사전 자료 조사, 나중에 검증할 가설 세우기, 인터뷰 가이드 준비, 실제 유저로 확인할 것을 전제한 임시 페르소나 정도이다.

**여기까지 읽은 연구들이 공통으로 중요하게 보는 것은 결국 실제 사람 기반으로 쌓은 리서치 데이터다. Salminen 등(2025)이 허용한 조건은 잘 알려진 제품, 이미 알려진 요구사항, 동질적인 집단이었고, 정확도를 높인 연구들의 전제도 같았다. Deep Binding에는 긴 인터뷰 기록이 필요했고, Park 등(2024)에는 2시간 인터뷰든 설문이든 실제 사람이 개인별로 자기보고(self-reporting)한 자료가 먼저 있어야 했다.**

---

## 정리

대체로 합성 유저가 사람 대상 리서치를 대체하지는 못한다는 의견이 대다수이지만, 대신 조건이 맞으면 보조 수단으로는 쓸 만하다고 본다.

**조건은 세 가지: (1) 리서치 데이터가 충분히 쌓인 분야일 것, (2) 유저 리서치를 대체한다기 보다는 참여 디자인(participatory design) 방법에 따라 마치 이해관계자와 대화하듯이 합성 유저의 의견을 구하면서 되묻고 테스트하는 용도로 쓸 것, (3) 어떤 형태로든 합성 유저 응답에 대한 검증(validation) 절차를 같이 둘 것.**

---

## 참고 문헌

- [Gu, Chandrasegaran & Lloyd, "Synthetic users: insights from designers' interactions with persona-based chatbots"](https://doi.org/10.1017/S0890060424000283) — AI EDAM, 2025. 합성 유저 개념을 제안하고, 디자이너 20명을 대상으로 문서와 챗봇을 비교한 집단 간 실험. 아이디어 137개 대 137개, "실제 인물 같다" 6.0 대 3.0
- [Salminen, Amin, Jung & Jansen, "The Use of Large Language Models in HCI: A Critical Analysis of Synthetic Users"](https://doi.org/10.1145/3745900.3746108) — Augmented Humans, 2025. 합성 유저가 확산되는 배경, 그에 따르는 위험, 사용 가능한 조건과 그렇지 않은 조건
- [Park et al., "LLM Agents Grounded in Self-Reports Enable General-Purpose Simulation of Individuals"](https://arxiv.org/abs/2411.10109) — 2024. 미국 성인 1,052명을 2주 뒤 재조사해 사람 쪽 노이즈를 먼저 잰 연구. GSS 기준 참가자 자기 일치율 79.53%, 인터뷰 기반 에이전트 원 정확도 65.67%, 정규화 정확도 0.83
- [Romberg et al., "Hybrid Panels: Toward Human-AI Collaboration in Survey Research"](https://arxiv.org/abs/2608.22582) — 2026. 사람 패널과 LLM을 같은 조사 안에 두고 웨이브마다 보정하는 설계. 독일 1,201명 파일럿, 참여 의향 83% 대 69%
- [Kuric, Demcak & Krajcovic, "What Would GPT Click: Practical Effects of Human-AI Behavioral Misalignment and the Cost of Synthetic Participants in User Experience"](https://arxiv.org/abs/2605.18302) — 2026. 실무 퍼스트 클릭 테스트 12건(3,431명)으로 GPT의 클릭 예측을 검증. 과제의 53%에서 분포가 유의하게 달랐고, 페르소나·단계별 추론·샘플링 조정 모두 개선 효과 없음
- [Kang et al., "Deep Binding of Language Model Virtual Personas"](https://arxiv.org/abs/2504.11673) — 2025. 인터뷰 전사록을 배경 서사로 부여해 정치 성향 설문의 응답 분포 재현을 개선(Wasserstein 거리 기준 87%)
- [DeepPersona: A Generative Engine for Scaling Deep Synthetic Personas](https://arxiv.org/abs/2511.07338) — 2025. 수백 개의 구조화된 속성과 1MB 규모의 서술형 텍스트를 함께 쓰는 페르소나
- [Rosala & Moran, "Synthetic Users: If Nothing Is Real, Everything Is Permitted"](https://www.nngroup.com/articles/synthetic-users/) — Nielsen Norman Group, 2024. 실무 관점의 회의론. 비위 맞추기와 과도한 낙관, 우선순위 부재, 행동 데이터의 부재를 지적하고 허용 가능한 용도를 제한
- [Anand, "Persona Engineering: A Field Guide to AI Synthetic Personas"](https://www.youtube.com/watch?v=YnNF55QV0zs) — AI Engineer World's Fair, 2026. 일기예보 비유, 태도와 행동의 간극

`
