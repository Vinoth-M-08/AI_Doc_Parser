import { createContext, useContext, useEffect, useState } from 'react'
import { getSettings } from '../api/analysisApi.js'

const SettingsContext = createContext(null)
const KEY_USE_AI = 'docready.useAi'
const KEY_MODEL = 'docready.model'

export function SettingsProvider({ children }) {
  const [useAi, setUseAi] = useState(() => {
    const v = localStorage.getItem(KEY_USE_AI)
    return v === null ? true : v === 'true'
  })
  const [model, setModel] = useState(() => localStorage.getItem(KEY_MODEL) || '')
  const [geminiConfigured, setGeminiConfigured] = useState(false)
  const [defaultModel, setDefaultModel] = useState('')
  const [availableModels, setAvailableModels] = useState([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    getSettings()
      .then((s) => {
        setGeminiConfigured(!!s.geminiConfigured)
        setDefaultModel(s.defaultModel || '')
        setAvailableModels(s.availableModels || [])
        if (!localStorage.getItem(KEY_MODEL) && s.defaultModel) {
          setModel(s.defaultModel)
        }
      })
      .catch(() => setGeminiConfigured(false))
      .finally(() => setLoaded(true))
  }, [])

  const updateUseAi = (v) => {
    setUseAi(v)
    localStorage.setItem(KEY_USE_AI, String(v))
  }
  const updateModel = (v) => {
    setModel(v)
    localStorage.setItem(KEY_MODEL, v)
  }

  return (
    <SettingsContext.Provider
      value={{
        useAi,
        setUseAi: updateUseAi,
        model,
        setModel: updateModel,
        geminiConfigured,
        defaultModel,
        availableModels,
        loaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
