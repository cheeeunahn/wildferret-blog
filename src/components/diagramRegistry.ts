import type { FC } from 'react'
import {
  FlowComparison,
  PeersArchitecture,
  TerminalTeam,
  TmuxSplit,
  VocWorkflow,
} from './Diagrams'

const diagrams: Record<string, FC> = {
  'voc-workflow': VocWorkflow,
  'terminal-team': TerminalTeam,
  'peers-architecture': PeersArchitecture,
  'tmux-split': TmuxSplit,
  comparison: FlowComparison,
}

export function getDiagram(id: string): FC | undefined {
  return diagrams[id]
}
