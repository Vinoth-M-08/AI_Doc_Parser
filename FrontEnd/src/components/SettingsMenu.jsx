import { useState, useRef, useEffect } from 'react'
import { Settings, Sparkles, Check, X, ChevronDown } from 'lucide-react'
import { useSettings } from '../context/SettingsContext.jsx'

export default function SettingsMenu() {
  const { useAi, setUseAi, geminiConfigured, model, setModel, availableModels, defaultModel } = useSettings()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = () => {
    if (!geminiConfigured) return
    setUseAi(!useAi)
  }

  const aiActive = useAi && geminiConfigured

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="btn-secondary !px-3" aria-label="Settings">
        <Settings size={14} />
        <span className="hidden sm:inline">Settings</span>
        {aiActive && (
          <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent/15 text-accent-dark text-[10px] font-semibold">
            <Sparkles size={10} /> AI
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 card p-4 z-50 animate-fade-in">
          <div className="font-display font-semibold text-ink-900 mb-1 flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            Gemini AI Analyzer
          </div>
          <p className="text-xs text-ink-500 mb-4 leading-relaxed">
            When enabled, document content is sent to Google Gemini for richer readability and migration insights.
            When disabled, a deterministic heuristic is used.
          </p>

          <button
            onClick={toggle}
            disabled={!geminiConfigured}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition
              ${!geminiConfigured ? 'bg-ink-50 border-ink-200 text-ink-400 cursor-not-allowed'
                : useAi ? 'bg-accent/5 border-accent/30' : 'bg-white border-ink-200 hover:border-ink-300'}`}>
            <div className="text-left">
              <div className="text-sm font-medium text-ink-900">Use Gemini AI</div>
              <div className="text-[11px] text-ink-500 mt-0.5">
                {!geminiConfigured ? 'GEMINI_API_KEY not set on server' : useAi ? 'Enabled' : 'Disabled — using heuristic'}
              </div>
            </div>
            <div className={`relative w-10 h-5 rounded-full transition
              ${aiActive ? 'bg-accent' : 'bg-ink-300'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all
                ${aiActive ? 'left-[22px]' : 'left-0.5'}`} />
            </div>
          </button>

          {/* Model picker */}
          <div className={`mt-3 ${aiActive ? '' : 'opacity-50 pointer-events-none'}`}>
            <label className="block text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-1.5">
              Model
            </label>
            <div className="relative">
              <select
                value={model || defaultModel}
                onChange={(e) => setModel(e.target.value)}
                disabled={!aiActive}
                className="w-full appearance-none px-3 py-2 pr-9 rounded-lg border border-ink-200 bg-white text-sm text-ink-900 font-mono focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              >
                {availableModels.length === 0 && <option value="">{defaultModel || '—'}</option>}
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}{m === defaultModel ? '  (default)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
            </div>
            <p className="text-[10px] text-ink-400 mt-1.5 leading-relaxed">
              Tip: <span className="font-semibold">flash-lite</span> has the highest free quota.
              Larger models may hit 429 rate limits.
            </p>
          </div>

          <div className={`mt-4 flex items-center gap-1.5 text-[11px]
            ${geminiConfigured ? 'text-success' : 'text-warning'}`}>
            {geminiConfigured ? <Check size={12} /> : <X size={12} />}
            <span>{geminiConfigured ? 'API key detected on server' : 'API key not configured'}</span>
          </div>
        </div>
      )}
    </div>
  )
}
