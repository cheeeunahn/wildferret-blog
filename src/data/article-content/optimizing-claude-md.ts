export const optimizingClaudeMdContent = `## 요약

- \`CLAUDE.md\`와 같은 에이전트 지시 파일을 넣어도 에이전트의 성공률이나 PR 머지율은 뚜렷하게 나아지지 않았다. 실행 시간이 줄었다는 연구도, 비용이 늘었다는 연구도 있다.
- 에이전트 지시 파일과 코드가 다를 경우에는 에이전트는 대부분 지시 파일을 따랐다. 사용자 레벨 지시 파일에 문서와 코드가 다르면 코드를 따르라는 문장 한 줄을 넣자, 코드를 따른 선택이 4.2%에서 91.4%로 늘었다.
- 읽어본 자료를 바탕으로 보면, 코드를 보면 알 수 있는 설명이나 모델이 이미 아는 원칙은 덜어 내고 린터로 확인할 수 있는 규칙은 검사로 옮길 수 있겠다. 지시 파일에는 결정의 이유와 특정 작업에만 필요한 절차를 경로·명령·값까지 구체적으로 남긴다. → [지시 파일 정리 기준](#지시-파일-정리-기준)

---

최근에 회사 동료 개발자가 Claude API 호출 비용과 PR 비용을 줄이려고 프롬프트를 다듬고 있었다. 중복된 부분을 걷어 내고, 테스트로 대신할 수 있는 영역을 하나씩 정해 나가는 과정을 거치고 계셨다. 무엇을 프롬프트에 남기고 무엇을 테스트로 넘길지 고민하는 모습을 본 것을 계기로, \`AGENTS.md\`·\`CLAUDE.md\` 같은 에이전트 지시 파일을 다룬 자료들을 읽게 되었다.

체계적인 가이드라인을 세우려는 글은 절대로 아니고, 필자는 가벼운 논문 리뷰를 통해 다음 질문을 가볍게 던져보고자 한다.

**"무엇을 에이전트 지시 파일에 문장으로 남기고 무엇을 검사 코드로 바꿀 수 있을까?"**

---

## 에이전트 지시 파일

### 지시 파일이 작업 결과에 미치는 영향

Lulla et al., Gloaguen et al., Arabat & Sayagh는 에이전트 지시 파일이 있을 때 작업 결과가 나아지는지를 봤다. 세 연구 모두 성공률이나 머지율이 뚜렷하게 나아지지는 않았다는 결론이 나왔다.

![AGENTS.md가 있을 때와 없을 때 에이전트가 과제 하나를 끝내기까지 걸린 시간(초)의 분포를 나란히 그린 바이올린 플롯. 지시 파일이 있을 때(초록)는 중앙값이 더 낮고 가장 오래 걸린 실행도 800초 아래인 반면, 없을 때(주황)는 1,000초를 넘긴 실행까지 있다](/assets/images/optimizing-claude-md-lulla-runtime.webp "AGENTS.md가 있을 때(초록)와 없을 때(주황), 과제 하나를 끝내기까지 걸린 시간의 분포. 출처: [Lulla et al.](https://arxiv.org/abs/2601.20404v2), 2026, Figure 1")

- [Lulla et al.](https://arxiv.org/abs/2601.20404v2)은 Codex에게 레포 10개의 작은 PR 124개(100줄·5파일 이하)를 다시 구현하게 했다. 같은 과제를 \`AGENTS.md\`가 있을 때와 없을 때 한 번씩 돌려 보니, 지시 파일이 있을 때 실행 시간(중앙값)은 98.6초에서 70.3초로 28.6% 줄고 출력 토큰도 16.6% 줄었다. 하지만 빨라졌다고 더 잘했다고 볼 수는 없다. 결과가 맞는지는 테스트 없이 사람이 50개 과제만 훑어봤고, 비용은 보고하지 않았다.
- [Gloaguen et al.](https://arxiv.org/abs/2602.11988v3)은 에이전트 4종에게 SWE-bench Lite 과제 300개와, 개발자가 직접 쓴 지시 파일이 있는 레포 12개의 과제 138개를 풀게 했다. LLM이 만든 지시 파일을 주면 성공률이 0.5~2%p 낮아졌고, 개발자가 쓴 지시 파일을 주면 2.4%p 높아졌다. 둘 다 우연으로도 나올 만큼 작은 차이여서 통계적으로 유의하지 않았고, 효과가 있다고 말할 수 없다. 비용과 스텝 수는 두 경우 모두 분명히 늘었다. 에이전트가 지시 파일에 적힌 대로 테스트를 돌리고, 검색하고, 레포의 파일을 더 많이 읽었기 때문이다.
- [Arabat & Sayagh](https://doi.org/10.1145/3793302.3793601)는 프로젝트 148개에서 에이전트가 만든 PR 15,549개를 모아, 지시 파일을 처음 넣기 전과 후의 머지율을 비교했다. 머지율이 20% 이상 오른 프로젝트(27.7%)와 내린 프로젝트(26.4%)가 비슷하게 많았다. 토론 댓글이 늘거나 머지까지 더 오래 걸린 프로젝트도 있었다. 같은 기간 지시 파일을 넣지 않은 프로젝트와 비교하지 않았기 때문에, 이 변화가 지시 파일 때문인지는 알 수 없다.

### 코드 베이스를 읽고도 지시 파일에 적혀 있는 것을 따른다

[Xu & Wu(2026)](https://arxiv.org/abs/2610.30571)는 일부러 코드와 어긋나는 지시 파일을 둔 Python 프로젝트 40개를 만들었다. 예를 들어 \`CLAUDE.md\`에는 "경고와 상태 메시지는 \`print()\`로 출력한다"고 적혀 있는데, 기존 모듈은 모두 \`logging\`을 쓴다. 팀이 \`print\`에서 \`logging\`으로 옮기고 지시 파일은 고치지 않은 상황이다.

- **설정:** 로그 출력·경로 처리·에러 전달 방식·테스트 스타일·금액 저장 방식 등 컨벤션 16종을 골랐다. 프로젝트마다 기존 코드는 한쪽 컨벤션을 일관되게 쓰고, 지시 파일은 반대쪽을 요구한다. Claude Code(Claude Sonnet 5.5)와 Codex CLI(GPT-6 Sol)에게 기능 하나를 추가하게 했다. 작업 요청에는 컨벤션 이야기를 넣지 않았다. 에이전트마다 프로젝트 40개를 두 번씩, 80번 실행했다.
- **결과:** 에이전트의 선택 720개 중 90.1%(649개)가 지시 파일을 따랐고, 기존 코드를 따른 건 4.2%였다. Claude Code는 86.4%, Codex CLI는 93.9%가 지시 파일을 따랐다. 16종 중 14종에서 지시 파일을 더 많이 따랐다.

두 에이전트가 지시 파일을 따르는 방식은 달랐다.

- **Claude Code는 불일치를 알아차리고도 지시 파일 내용을 따랐다.** 80번 중 79번은 마지막 답변에서 기존 모듈은 \`logging\`을 쓰는데 \`CLAUDE.md\`는 \`print\`를 요구한다고 짚었다. 그러고도 그 79번에서 내린 선택의 86.2%가 지시 파일을 따랐다.
- **Codex CLI는 기존 코드를 지시 파일에 맞춰 고쳤다.** 80번 중 20번은 잘 돌아가던 코드를 지시 파일에 맞게 다시 썼다. 중앙값으로 코드 파일 9개에서 198줄을 지웠다. 실행이 끝난 뒤 원래 테스트를 되돌려 돌리자 20번 중 17번이 실패했다. 나머지 60번은 불일치를 언급하지 않고 지시 파일을 따랐다.

다른 논문에서도 에이전트는 지시 파일에 적힌 내용을 따랐다. Gloaguen et al.의 트레이스에서 에이전트는 지시 파일에 Python 패키지 관리 도구인 \`uv\`가 적혀 있으면 과제당 1.6번 썼고, 없으면 거의 쓰지 않았다. [Chatlatanagulchai et al.](https://doi.org/10.1145/3840295)의 연구에서는 "4칸 들여쓰기" 규칙을 추가한 두 레포에서 AI가 쓴 코드의 위반율이 크게 떨어졌다.

### 에이전트가 지시 파일을 우선하는 이유

Xu & Wu는 원인을 지시 파일과 코드가 모델에 들어가는 경로의 차이에서 찾는다.

Claude Code는 \`CLAUDE.md\`를 시스템 프롬프트 바로 뒤의 사용자 메시지에 넣고, 앞에 이런 문장을 붙인다.

~~~text
"Codebase and user instructions are shown below. Be sure to adhere to these instructions. IMPORTANT: These instructions OVERRIDE any default behavior and you MUST follow them exactly as written."
~~~

반면 기존 코드는 에이전트가 코드 파일을 열었을 때 **도구 출력**으로 들어온다. 모델은 지시를 도구 출력보다 우선하도록 훈련받는다(instruction hierarchy). 웹 페이지나 파일 속에 숨은 "이전 지시를 무시하라" 같은 프롬프트 인젝션을 막기 위해서다.

강조 문구 때문만은 아니다. Codex CLI는 그런 문구 없이 \`AGENTS.md\`를 넣는데도 93.9%가 지시 파일을 따랐다.

### 기존 코드를 우선하도록 지시한 실험

Xu & Wu는 사용자 레벨 지시 파일(\`~/.claude/CLAUDE.md\`, \`~/.codex/AGENTS.md\`)에 아래 문장 하나를 넣었다.

~~~text
When a repository's documentation and its existing code disagree, follow the conventions used in the existing code, and in your final reply point out each inconsistency you found between the documentation and the code.
~~~

"레포의 문서와 기존 코드가 다르면 기존 코드의 컨벤션을 따르고, 마지막 답변에서 문서와 코드 사이의 불일치를 하나씩 짚어 달라"는 뜻이다.

- 코드를 따른 선택이 4.2%에서 91.4%로 올랐다. Claude Code는 7.5% → 94.4%, Codex CLI는 0.8% → 88.3%.
- 두 에이전트 모두 80번 실행 전부에서 발견한 불일치를 보고했다.
- 기존 코드를 다시 쓴 실행은 없었고, 테스트 통과율은 89.4%에서 100%로 올랐다. 도구 호출과 실행 시간도 조금 줄었다.

![에이전트의 선택이 지시 파일·코드·어느 쪽도 아님 중 무엇과 맞았는지를 나타낸 가로 막대 그래프. 문장이 없을 때 Claude Code는 86.4%, Codex CLI는 93.9%가 지시 파일을 따랐다. 문장을 넣자 코드를 따른 비율이 Claude Code 94.4%, Codex CLI 88.3%로 바뀌었다](/assets/images/optimizing-claude-md-one-sentence-fix.webp "한 문장을 넣기 전과 후, 에이전트의 선택이 지시 파일과 코드 중 어느 쪽과 맞았는지. 출처: [Xu & Wu](https://arxiv.org/abs/2610.30571), 2026")

이 문장을 넣으면 지시 파일에서 코드와 어긋난 내용을 미리 찾아 고치지 않아도 된다. 실험은 직접 만든 작은 Python 프로젝트에서, 지시 파일 쪽이 업데이트되지 않은 경우만 다뤘다. 반대로 \`print\`에서 \`logging\`으로 **옮기는 중**이라 지시 파일에 새 컨벤션을 먼저 적어 둔 팀이라면, 이 문장이 에이전트를 옛 코드 쪽으로 되돌릴 수 있다.

이 문장을 넣어도 업데이트되지 않은 내용은 지시 파일에 그대로 남고, 사람이 직접 고쳐야 한다.

---

## 지시 파일 정리 기준

지시 파일에 흔히 적는 내용을 지울 것, 검사로 옮길 것, 남길 것으로 나눠 보았다. 논문 결과를 바탕으로 한 필자의 해석이고, 표 자체를 검증한 것은 아니다.

| 지시 파일에 적힌 내용 | 처리 |
| --- | --- |
| 코드를 보면 알 수 있는 설명 | 지운다 |
| 모델이 이미 아는 일반 원칙 | 빼고 돌려 봐서 결과가 같으면 지운다 |
| 다른 문서와 겹치는 내용 | \`AGENTS.md\` 한 곳에 모으고, 나머지는 그곳을 가리키게 한다 |
| 끝난 작업에 대한 메모 | 내용을 추가하는 PR에서 함께 지운다 |
| 컴퓨터로 확인할 수 있는 규칙(들여쓰기·import 경로) | 린터·포매터·훅으로 옮긴다 |
| 실행 명령(\`pnpm test\` 등) | 남기되, \`package.json\`과 맞는지 검사한다 |
| 결정의 이유·손대면 안 되는 곳 | 남긴다 |
| 특정 작업에만 필요한 절차 | 언제 필요한지와 함께 남긴다 |
| 옮기는 중인 컨벤션 | 범위를 적어 남긴다 |

\`/init\`으로 자동 생성한 지시 파일도 이 표로 한 번 훑어볼 만하다. 코드에서 읽어 낸 내용으로 채워지므로 지울 줄이 섞이기 쉽다.

### 지울 내용

![개발자가 책상에 앉아 지시 파일의 여러 장을 휴지통에 버리고, 짧은 한 장만 책상 위에 남겨 두는 일러스트](/assets/images/optimizing-claude-md-section-delete.webp "코드에 이미 있거나, 다른 문서와 겹치거나, 끝난 작업의 메모는 지시 파일에서 지운다 (AI 생성)")

**코드를 보면 알 수 있는 설명.** "진행 메시지는 \`print()\`로 출력한다" 같은 문장은 지시처럼 보이지만, 실은 그 문장을 쓸 때의 코드를 설명한 말이다. 코드가 \`logging\`으로 바뀌면 틀린 설명이 되는데도 에이전트는 이를 지시로 읽고 따른다. 에이전트는 코드를 직접 읽으니, 이런 문장은 없어도 된다.

**모델이 이미 아는 일반 원칙.** "읽기 쉬운 코드를 쓴다" 같은 원칙은 적지 않아도 모델이 안다. Intel의 Nikolay Petrov가 AI Engineer에서 한 [발표](https://www.youtube.com/watch?v=yzx4IuEh_tU)에 이를 잰 실험이 나온다. 스킬 파일(\`SKILL.md\`)의 내용을 질문으로 바꿔 스킬 없이 물었더니, Sonnet 5.5가 53~71%를 맞혔다(요지만 맞으면 정답으로 쳤을 때).

**다른 문서와 겹치는 내용.** 같은 내용이 \`CLAUDE.md\`·\`AGENTS.md\`·README에 따로 있으면, 하나만 고쳤을 때 서로 다른 말을 하게 된다([Galster et al.](https://doi.org/10.1145/3805760.3814887)). 효과도 적다. Gloaguen et al.의 실험에서 LLM이 만든 지시 파일은 성공률을 높이지 못했고, 레포의 다른 문서를 모두 지운 뒤에야 조금 높였다.

**끝난 작업에 대한 메모.** "○○ 마이그레이션 진행 중" 같은 메모는 작업이 끝나도 남는다. 지시 파일은 늘기만 하고 잘 줄지 않는다. Chatlatanagulchai et al.이 본 \`CLAUDE.md\`는 커밋 한 번에 중앙값 57단어가 늘었지만, 지워진 건 15단어도 안 됐다.

### 검사로 옮길 내용

![개발자가 책상 위 지시 파일의 규칙을 보며 노트북에 코드를 입력하는 뒷모습 일러스트. 노트북 화면에는 코드와 그 아래 검사 결과 창이 보인다](/assets/images/optimizing-claude-md-section-check.webp "컴퓨터로 확인할 수 있는 규칙은 검사로 옮겨, 어긋나면 바로 걸리게 한다 (AI 생성)")

**컴퓨터로 확인할 수 있는 규칙.** 들여쓰기나 import 경로 같은 규칙은 지시 파일에 적어도 효과가 있다(Chatlatanagulchai et al.의 "4칸 들여쓰기" 사례). 하지만 코드와 어긋나도 아무것도 실패하지 않는다. 린터·포매터·훅으로 옮기면 어긋나는 순간 검사가 실패하니, 틀린 채로 남지 않는다.

**실행 명령.** "테스트는 \`pnpm test\`로 돌린다" 같은 명령은 지시 파일에 남긴다. 다만 \`package.json\`에서 스크립트 이름이 바뀌면 함께 틀려지므로, 둘이 맞는지 스크립트로 검사한다. Chatlatanagulchai et al.이 제안한 방법이다.

### 지시 파일에 남길 내용

![개발자가 노트북 옆에서 펼친 노트에 몇 줄을 손으로 적는 일러스트](/assets/images/optimizing-claude-md-section-keep.webp "결정의 이유와 손대면 안 되는 곳, 작업마다 필요한 절차, 옮기는 중인 컨벤션을 경로·명령까지 구체적으로 남긴다 (AI 생성)")

**결정의 이유와 손대면 안 되는 곳.** 코드는 무엇을 하는지는 보여 주지만, 왜 다른 방법을 쓰지 않았는지는 보여 주지 않는다. "외부 API 호출 제한 때문에 일부러 순차로 호출한다" 같은 문장은 코드에서 읽어 낼 수 없다.

**특정 작업에만 필요한 절차.** "작업이 끝나면 테스트를 돌린다"처럼 조건 없이 적으면, 에이전트는 문서 오타 하나를 고칠 때도 테스트를 돌린다. Gloaguen et al.이 GPT-5.2로 돌린 실험에서는 테스트 지시를 빼자, 성공률에 유의한 차이 없이 비용만 15~21% 줄었다. 절차마다 언제 필요한지를 함께 적는다.

~~~md
- 문서 본문만 수정하면 링크만 확인한다.
- 실행 코드를 수정하면 관련 테스트를 실행한다.
- 공용 스타일이나 라우트를 수정하면 빌드와 해당 화면을 확인한다.
- 실행하지 못한 필수 검증은 완료 보고에 이유와 함께 적는다.
~~~

**옮기는 중인 컨벤션.** \`print\`에서 \`logging\`으로 옮기는 중이라면 코드에는 둘이 섞여 있어, 코드만 봐서는 어느 쪽이 새 규칙인지 알 수 없다. 그래서 범위를 적어 둔다. "새 코드는 \`logging\`을 쓴다. 기존 \`print\`는 옮기는 중이다."

**구체적으로 적기.** 남기는 내용은 경로·명령·값까지 구체적으로 적는다. 길이는 기준이 아니다. Gloaguen et al.은 지시 파일 길이와 성공률 사이에서 관계를 찾지 못했다.

구체성이 중요한 이유는 앞의 Petrov 실험에서도 보인다. 채점 기준을 "조건과 세부까지 맞아야 정답"으로 바꾸자, Opus 5.5가 스킬 없이 맞힌 비율은 70%에서 22%로 떨어졌다. 모델은 대략적인 원칙은 알아도 정확한 형식·이름·숫자는 모른다. 지시 파일이 채워 줄 것은 그 부분이다.

---

## 마치며

이 블로그에 적용한다면, 일단 \`CLAUDE.md\`에서 코드를 보면 알 수 있는 설명을 걷어내고 검사로 확인할 수 있는 규칙은 옮겨 볼 수 있겠다. 모델이 이미 아는 줄을 고를 때는 발표에서 쓴 [Dokimi](https://github.com/intel/dokimi)를 빌려 볼 수도 있다. 스킬뿐 아니라 레포의 \`AGENTS.md\`도 다룬다. 그렇게 줄인 \`CLAUDE.md\`로 에이전트의 작업 결과가 달라지는지 확인해 볼 수 있지 않을까. 여유가 될 때 한 번 시도해보면 좋겠다.

그중 첫 단계는 먼저 해 보았다. 코드나 README를 보면 알 수 있는 설명(스택·라우트·스크립트 설명, 글 쓰는 법)을 지우고, 린트로 잡을 수 있는 규칙은 린트 규칙으로 옮겼다. 그렇게 \`CLAUDE.md\`가 40KB에서 21KB로 줄었다. 줄인 파일은 대략 이런 모양이다.

~~~md
# CLAUDE.md

<!-- 첫머리에 무엇을 남기는 파일인지 밝힌다 -->
It holds what the code cannot tell you: the reasons behind
decisions, the traps, and the steps a particular kind of task needs.
Rules a check can enforce live in that check, and this file only
points at it. When this file and the code disagree, say so rather
than silently following either.

## Commands
<!-- package.json에서 생성하고, 어긋나면 pre-push 훅이 실패한다 -->
pnpm build   # astro check + astro build → dist/
pnpm test    # Vitest: unit, lint-rule and script tests

## What to check, by kind of change
<!-- 절차마다 언제 필요한지를 함께 적는다 -->
- **Article body only** (\`src/data/\`): \`pnpm build\`
- **Logic** (\`src/content\`, \`scripts/\`, …): \`pnpm test\` and \`pnpm lint\`
- **Docs only:** nothing beyond the pre-commit formatting.

## Layers
<!-- 규칙은 린트가 맡고, 여기에는 규칙 이름과 이유가 있는 곳만 남긴다 -->
\`local/no-cross-layer-import\` enforces the import rules; the zones
and their reasons are in \`eslint-rules/layer-zones.js\`, the decision
in \`docs/adr/0001-layered-architecture.md\`.
~~~

---

## 부록: 논문 요약

| 논문 | 종류 | 핵심 결과 | 주의 |
| --- | --- | --- | --- |
| Xu & Wu | 통제 실험 | 지시 파일과 코드가 어긋나면 선택의 90.1%가 지시 파일을 따름. 한 문장으로 91.4%가 코드를 따르게 됨 | 직접 만든 작은 Python 프로젝트, 지시 파일 쪽이 업데이트되지 않은 경우만 |
| Lulla et al. | 통제 실험 | 작은 PR에서 실행 시간 중앙값 −28.6%, 출력 토큰 −16.6% | 정확성은 사람이 훑어보기만 함, 비용(USD) 미보고 |
| Gloaguen et al. | 벤치마크 실험 | 성공률 개선 미입증, 비용 +20~23% | "성능 하락"이 아니라 "개선 미입증" |
| Arabat & Sayagh | 실제 PR 전후 비교 | 머지율이 20% 이상 오른 프로젝트 27.7%, 내린 프로젝트 26.4% | 대조군 없는 전후 비교 |
| Galster et al. | 실태 조사 | 90.6%가 지시 파일만 씀. \`AGENTS.md\`가 공통 표준이 되어 감 | 무엇을 쓰는지일 뿐, 무엇이 효과적인지는 아님 |
| Chatlatanagulchai et al. | 실태 조사 | 자주 고치지만 삭제보다 추가가 많음. 보안·성능 지시는 15% 미만 | 가독성 지표의 신뢰도가 낮음 |

---

## 참고 자료

- [Xu & Wu, "Stale Instruction Files Override the Code in Coding Agents: A One-Sentence Fix"](https://arxiv.org/abs/2610.30571) — arXiv, 2026. 지시 파일과 코드가 어긋날 때 에이전트가 지시 파일을 따르는 비율(90.1%)과, 사용자 레벨 지시 파일의 한 문장으로 코드를 따르게 만든 실험(4.2% → 91.4%)
- [Lulla et al., "On the Impact of AGENTS.md Files on the Efficiency of AI Coding Agents"](https://arxiv.org/abs/2601.20404v2) — arXiv, 2026. 작은 PR 124개에서 실행 시간 중앙값 −28.6%, 출력 토큰 −16.6%
- [Gloaguen et al., "Evaluating AGENTS.md: Are Repository-Level Context Files Helpful for Coding Agents?"](https://arxiv.org/abs/2602.11988v3) — arXiv, 2026. 성공률 개선 미입증, 비용 +20~23%, 테스트 지시를 뺀 추가 실험
- [Arabat & Sayagh, "Toward Instructions-as-Code: Understanding the Impact of Instruction Files on Agentic Pull Requests"](https://doi.org/10.1145/3793302.3793601) — MSR '26. 프로젝트 148개의 지시 파일 도입 전후 머지율 비교
- [Galster et al., "Configuring Agentic AI Coding Tools: An Exploratory Study"](https://doi.org/10.1145/3805760.3814887) — AIware '26. GitHub 레포 2,853개의 에이전트 설정 방법 8가지와 도입 현황
- [Chatlatanagulchai et al., "Agent READMEs: An Empirical Study of Context Files for Agentic Coding"](https://doi.org/10.1145/3840295) — ACM TOSEM. 컨텍스트 파일 2,303개의 구조·유지보수·내용 분석, 컨텍스트 부채
- [Nikolay Petrov, "Your SKILL.md Is 70% Stuff the Model Already Knows"](https://www.youtube.com/watch?v=yzx4IuEh_tU) — AI Engineer 발표, 2026. 논문이 아닌 발표로, 스킬 파일을 사실 단위로 쪼개 모델이 이미 아는 비율(45~71%)과 엄격하게 채점했을 때의 차이(Opus 5.5 70% → 22%)를 잰 실험실 연구. 도구는 [Dokimi](https://github.com/intel/dokimi)
- [Intel, Dokimi, "Evidence: a 33-skill content-novelty study"](https://github.com/intel/dokimi/blob/main/dokimi/docs/skill-novelty-evidence.md) — GitHub 문서, 2026. 논문이 아닌 도구 문서로, 스킬 파일 속 숫자 값을 틀린 값으로 바꾸자 세 모델 계열이 그 값을 94%(그럴듯한 값)·85%(64배 틀린 값) 그대로 답한 소규모 실험(§10.20)
`
