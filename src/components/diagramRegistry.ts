import type { ComponentType } from 'react'
import {
  VocWorkflow,
  TerminalTeam,
  PeersArchitecture,
  TmuxSplit,
  FlowComparison,
} from './Diagrams'

// Diagrams are only needed by one long-form article. Keeping the registry here
// makes their ownership explicit.
//
// They render at build time with no client:* directive, so there is nothing to
// lazy-load: React.lazy needs a <Suspense> boundary and a client runtime, and
// these pages ship neither. Adding a hook or an event handler to any diagram
// breaks that and would require a client:* directive at the call site.
const diagrams: Record<string, ComponentType> = {
  'voc-workflow': VocWorkflow,
  'terminal-team': TerminalTeam,
  'peers-architecture': PeersArchitecture,
  'tmux-split': TmuxSplit,
  comparison: FlowComparison,
}

export function getDiagram(id: string): ComponentType | undefined {
  return diagrams[id]
}
