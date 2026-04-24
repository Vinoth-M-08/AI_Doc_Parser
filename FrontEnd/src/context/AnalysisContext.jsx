import { createContext, useContext, useState } from 'react'

const AnalysisContext = createContext(null)

export function AnalysisProvider({ children }) {
  const [analysis, setAnalysis] = useState(null)
  const [fileMeta, setFileMeta] = useState(null)

  const reset = () => {
    setAnalysis(null)
    setFileMeta(null)
  }

  return (
    <AnalysisContext.Provider value={{ analysis, setAnalysis, fileMeta, setFileMeta, reset }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext)
  if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider')
  return ctx
}
