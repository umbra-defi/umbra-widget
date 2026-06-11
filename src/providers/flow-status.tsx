import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from 'react'

export type FlowStatus = 'idle' | 'pending' | 'success' | 'error'

interface FlowStatusValue {
  status: FlowStatus
  setStatus: (s: FlowStatus) => void
}

const FlowStatusContext = createContext<FlowStatusValue>({
  status: 'idle',
  setStatus: () => {}
})

/**
 * Lifts the active flow's mutation status to the widget root so the outermost
 * modal can draw the status ring. One status at a time — only the mounted tab
 * reports, and resets to idle on unmount.
 */
export function FlowStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<FlowStatus>('idle')
  return (
    <FlowStatusContext.Provider value={{ status, setStatus }}>
      {children}
    </FlowStatusContext.Provider>
  )
}

/** Read the current flow status (for the modal-level ring). */
export function useFlowStatus(): FlowStatus {
  return useContext(FlowStatusContext).status
}

/** Report a flow's status upward; resets to idle when the flow unmounts. */
export function useReportFlowStatus(status: FlowStatus) {
  const { setStatus } = useContext(FlowStatusContext)
  useEffect(() => {
    setStatus(status)
  }, [status, setStatus])
  useEffect(() => () => setStatus('idle'), [setStatus])
}
