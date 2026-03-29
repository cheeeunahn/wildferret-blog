// ─── Minimal editorial diagram system ───

function Arrow() {
  return (
    <div className="flex justify-center py-1.5">
      <svg width="1" height="24" viewBox="0 0 1 24" className="text-ink-300">
        <line x1="0.5" y1="0" x2="0.5" y2="24" stroke="currentColor" strokeWidth="1" />
      </svg>
    </div>
  )
}

function BiArrow() {
  return (
    <div className="flex justify-center py-1">
      <svg width="7" height="28" viewBox="0 0 7 28" className="text-ink-300">
        <path d="M3.5,5 L1,0.5 M3.5,5 L6,0.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
        <line x1="3.5" y1="4" x2="3.5" y2="24" stroke="currentColor" strokeWidth="1" />
        <path d="M3.5,23 L1,27.5 M3.5,23 L6,27.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  )
}

function HArrow() {
  return (
    <svg width="24" height="8" viewBox="0 0 24 8" className="text-ink-300 shrink-0 mx-1">
      <line x1="0" y1="4" x2="20" y2="4" stroke="currentColor" strokeWidth="1" />
      <path d="M18,1.5 L22,4 L18,6.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-10 py-8 px-5 sm:px-8 border border-ink-100 rounded-xl bg-paper-warm/30">
      {children}
    </div>
  )
}

function StepNum({ n }: { n: number }) {
  return (
    <span className="text-[12px] font-medium text-ink-400 tracking-wide shrink-0">
      {String(n).padStart(2, '0')}
    </span>
  )
}

// ─── 1. VOC Workflow ───

function VocWorkflow() {
  const steps = [
    { n: 1, title: '데이터 수집', desc: '데이터 웨어하우스에서 VOC 원본 자동 추출 + NPS, 앱 평점, 리서치 자료 수집' },
    { n: 2, title: '독립 분석', desc: null, parallel: true },
    { n: 3, title: '교차 토론', desc: 'A의 분석을 B가 검토, B의 분석을 A가 검토. 데이터 근거를 들어 반론을 제기하고 합의점을 정리한다.' },
    { n: 4, title: '리포트 초안 작성', desc: null, tags: ['핵심 요약', '주요 발견', '긍정 신호', '이슈 테이블', '액션 아이템'] },
    { n: 5, title: 'CEO 관점 리뷰', desc: '의사결정에 도움이 되는가? 우선순위가 명확한가? 5분 안에 다 읽을 수 있는가?' },
    { n: 6, title: '최종 리포트 저장', desc: null },
  ]

  return (
    <Container>
      <div className="flex flex-col items-center">
        {steps.map((step, i) => (
          <div key={step.n} className="w-full max-w-[400px]">
            {i > 0 && <Arrow />}

            {step.parallel ? (
              <div>
                <div className="flex items-center gap-3 mb-3 justify-center">
                  <StepNum n={step.n} />
                  <span className="text-[15px] font-semibold text-ink-800">{step.title}</span>
                  <span className="text-[12px] text-ink-300">동시에 진행</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {['CX 전문가 A', 'CX 전문가 B'].map((name) => (
                    <div key={name} className="bg-white rounded-lg px-4 py-3.5 border border-ink-100">
                      <p className="text-[13px] font-semibold text-ink-700 mb-2.5">{name}</p>
                      <div className="space-y-1.5">
                        {['주제별 분류', '심각도 판단', '핵심 트렌드 3개', '대표 인용 추출'].map((item) => (
                          <p key={item} className="text-[12px] text-ink-400 flex items-center gap-2">
                            <span className="w-[3px] h-[3px] rounded-full bg-ink-300 shrink-0" />
                            {item}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`rounded-lg px-5 py-4 ${step.n === 6 ? 'bg-ink-50 text-center' : 'bg-white border border-ink-100'}`}>
                <div className={`flex items-center gap-3 ${step.n === 6 ? 'justify-center' : ''} ${step.desc || step.tags ? 'mb-2' : ''}`}>
                  <StepNum n={step.n} />
                  <span className="text-[15px] font-semibold text-ink-800">{step.title}</span>
                </div>
                {step.desc && (
                  <p className="text-[13px] text-ink-400 leading-relaxed pl-[30px]">{step.desc}</p>
                )}
                {step.tags && (
                  <div className="flex flex-wrap gap-1.5 pl-[30px]">
                    {step.tags.map((tag) => (
                      <span key={tag} className="text-[11px] text-ink-500 bg-ink-50 px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </Container>
  )
}

// ─── 2. Terminal Team ───

function TerminalTeam() {
  return (
    <Container>
      <div className="bg-white rounded-lg border border-ink-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-ink-100">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-ink-200" />
            <div className="w-2 h-2 rounded-full bg-ink-200" />
            <div className="w-2 h-2 rounded-full bg-ink-200" />
          </div>
          <span className="ml-1 text-[12px] text-ink-300">Claude Code</span>
        </div>

        <div className="px-5 py-5 text-[14px] leading-relaxed">
          <p className="text-ink-700 font-semibold mb-4">팀 리드 (메인 Claude)</p>

          <div className="pl-3 border-l border-ink-200 ml-0.5 space-y-2">
            <p className="text-ink-500 text-[13px]">
              <span className="text-ink-300 font-mono text-[12px]">├──</span>{' '}팀원 A: <span className="text-ink-400 italic">CX 전문가 — VOC 독립 분석 중...</span>
            </p>
            <p className="text-ink-500 text-[13px]">
              <span className="text-ink-300 font-mono text-[12px]">├──</span>{' '}팀원 B: <span className="text-ink-400 italic">CX 전문가 — VOC 독립 분석 중...</span>
            </p>
            <div className="text-ink-500 text-[13px]">
              <p><span className="text-ink-300 font-mono text-[12px]">└──</span>{' '}공유 할 일 목록:</p>
              <div className="pl-7 mt-1.5 space-y-1 text-[12px]">
                <p className="text-ink-400">✓ 데이터 수집</p>
                <p className="text-ink-500">→ 팀원 A 독립 분석 <span className="text-ink-300">진행 중</span></p>
                <p className="text-ink-500">→ 팀원 B 독립 분석 <span className="text-ink-300">진행 중</span></p>
                <p className="text-ink-300">○ 교차 토론</p>
                <p className="text-ink-300">○ 리포트 작성</p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-ink-100 flex gap-5 text-[12px] text-ink-300">
            <span><kbd className="px-1.5 py-0.5 bg-ink-50 rounded text-ink-400 text-[11px] font-mono">Shift+↓</kbd> 팀원 전환</span>
            <span><kbd className="px-1.5 py-0.5 bg-ink-50 rounded text-ink-400 text-[11px] font-mono">Ctrl+T</kbd> 할 일 목록</span>
          </div>
        </div>
      </div>
    </Container>
  )
}

// ─── 3. Peers Architecture ───

function PeersArchitecture() {
  const instances = [
    { num: '①', name: '프론트엔드', path: '/services/' },
    { num: '②', name: '노트 정리', path: '/Obsidian/' },
    { num: '③', name: '데이터 분석', path: '/analytics/' },
  ]

  return (
    <Container>
      <div className="flex flex-col items-center">
        <div className="grid grid-cols-3 gap-3 w-full max-w-md">
          {instances.map((inst) => (
            <div key={inst.num} className="bg-white rounded-lg px-3 py-3.5 text-center border border-ink-100">
              <p className="text-[13px] font-semibold text-ink-700">Claude {inst.num}</p>
              <p className="text-[12px] text-ink-400 mt-1">{inst.name}</p>
              <p className="text-[10px] text-ink-300 mt-0.5 font-mono">{inst.path}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-md">
          <BiArrow />
          <BiArrow />
          <BiArrow />
        </div>

        <div className="w-full max-w-md bg-ink-50 rounded-lg px-5 py-4">
          <p className="text-[14px] font-semibold text-ink-700 text-center mb-3">Claude Peers</p>
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-1.5">
            {['누가 어디서 뭘 하고 있는지 추적', 'AI 간 메시지 전달', '종료된 AI는 자동 정리'].map((item) => (
              <span key={item} className="text-[12px] text-ink-400 flex items-center gap-2">
                <span className="w-[3px] h-[3px] rounded-full bg-ink-300 shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Container>
  )
}

// ─── 4. tmux Split ───

function TmuxSplit() {
  const panes = [
    { title: 'Claude ① — 코드 작업', status: '> analyzing files...', detail: '3 files changed, 42 insertions' },
    { title: 'Claude ② — 문서 정리', status: '> updating notes...', detail: 'ObsidianVault/04-Research/' },
    { title: 'Claude ③ — VOC 분석', status: '> classifying...', detail: '287건 중 194건 완료 (67%)' },
    { title: 'Claude ④ — 리서치', status: '> searching...', detail: '경쟁사 랜딩페이지 5개 수집' },
  ]

  return (
    <Container>
      <div className="bg-white rounded-lg border border-ink-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-ink-100">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-ink-200" />
            <div className="w-2 h-2 rounded-full bg-ink-200" />
            <div className="w-2 h-2 rounded-full bg-ink-200" />
          </div>
          <span className="ml-1 text-[12px] text-ink-300">tmux — 4개 세션</span>
        </div>

        <div className="grid grid-cols-2">
          {panes.map((pane, j) => (
            <div
              key={pane.title}
              className={`px-4 py-3.5 ${
                j < 2 ? 'border-b' : ''
              } ${j % 2 === 0 ? 'border-r' : ''} border-ink-100`}
            >
              <p className="text-[12px] font-semibold text-ink-600 mb-1.5">{pane.title}</p>
              <p className="text-[11px] text-ink-300 font-mono">{pane.status}</p>
              <p className="text-[11px] text-ink-300 mt-1">{pane.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  )
}

// ─── 5. Flow Comparison ───

function Pill({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-[12px] font-medium shrink-0 rounded ${
        dark
          ? 'bg-ink-800 text-white'
          : 'bg-white text-ink-600 border border-ink-200'
      }`}
    >
      {children}
    </span>
  )
}

function FlowComparison() {
  return (
    <Container>
      <div>
        {/* Row 1: Sequential */}
        <div className="py-5 border-b border-ink-100">
          <p className="text-[11px] font-medium text-ink-300 tracking-wider uppercase mb-3">기존 — 에이전트 1개, 순서대로</p>
          <div className="flex items-center flex-wrap gap-y-2">
            <Pill dark>나</Pill>
            <HArrow />
            <Pill>A</Pill>
            <HArrow />
            <Pill>B</Pill>
            <HArrow />
            <Pill>C</Pill>
            <HArrow />
            <Pill>D</Pill>
            <HArrow />
            <Pill>결과</Pill>
          </div>
        </div>

        {/* Row 2: Agent Team */}
        <div className="py-5 border-b border-ink-100">
          <p className="text-[11px] font-medium text-ink-300 tracking-wider uppercase mb-3">에이전트 팀 — 역할 분담, 동시에</p>
          <div className="flex items-center flex-wrap gap-y-2">
            <Pill dark>나</Pill>
            <HArrow />
            <div className="flex flex-col gap-1.5">
              <Pill>분석가 A</Pill>
              <Pill>분석가 B</Pill>
            </div>
            <HArrow />
            <Pill>토론</Pill>
            <HArrow />
            <div className="flex flex-col items-center gap-1">
              <Pill>리포트</Pill>
              <span className="text-[10px] text-ink-300">CEO 리뷰</span>
            </div>
            <HArrow />
            <Pill>결과</Pill>
          </div>
        </div>

        {/* Row 3: Peers */}
        <div className="pt-5">
          <p className="text-[11px] font-medium text-ink-300 tracking-wider uppercase mb-3">Claude Peers — 프로젝트 간 소통</p>
          <div className="grid grid-cols-2 gap-2 max-w-[240px]">
            <Pill>프로젝트 A</Pill>
            <Pill>프로젝트 B</Pill>
            <Pill>프로젝트 C</Pill>
            <Pill>프로젝트 D</Pill>
          </div>
          <p className="text-[10px] text-ink-300 mt-2.5 max-w-[240px] text-center">←→ 필요할 때 메시지를 주고받는다</p>
        </div>
      </div>
    </Container>
  )
}

// ─── Export ───

const diagrams: Record<string, React.FC> = {
  'voc-workflow': VocWorkflow,
  'terminal-team': TerminalTeam,
  'peers-architecture': PeersArchitecture,
  'tmux-split': TmuxSplit,
  'comparison': FlowComparison,
}

export function getDiagram(id: string): React.FC | undefined {
  return diagrams[id]
}
