import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

type Diagram = LazyExoticComponent<ComponentType>

// Diagrams are only needed by one long-form article. Keeping the registry here
// makes their ownership explicit while loading the implementation on demand.
const diagrams: Record<string, Diagram> = {
  'voc-workflow': lazy(() => import('./Diagrams').then(({ VocWorkflow }) => ({ default: VocWorkflow }))),
  'terminal-team': lazy(() => import('./Diagrams').then(({ TerminalTeam }) => ({ default: TerminalTeam }))),
  'peers-architecture': lazy(() => import('./Diagrams').then(({ PeersArchitecture }) => ({ default: PeersArchitecture }))),
  'tmux-split': lazy(() => import('./Diagrams').then(({ TmuxSplit }) => ({ default: TmuxSplit }))),
  comparison: lazy(() => import('./Diagrams').then(({ FlowComparison }) => ({ default: FlowComparison }))),
}

export function getDiagram(id: string): Diagram | undefined {
  return diagrams[id]
}
