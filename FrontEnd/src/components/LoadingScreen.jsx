import { Loader2, FileSearch, Sparkles, CheckCircle2 } from 'lucide-react'
import { useEffect, useState } from 'react'

const STAGES = [
  { icon: FileSearch, label: 'Parsing document structure' },
  { icon: Loader2, label: 'Extracting metrics' },
  { icon: Sparkles, label: 'Running AI analysis' },
  { icon: CheckCircle2, label: 'Finalizing report' },
]

export default function LoadingScreen({ progress = 0 }) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 1800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[60vh] grid place-items-center px-6">
      <div className="w-full max-w-md text-center animate-fade-in">
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-ink-200" />
          <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
          <div className="absolute inset-0 grid place-items-center text-accent">
            <Sparkles size={22} />
          </div>
        </div>
        <h3 className="font-display text-xl font-semibold text-ink-900 mb-2">Analyzing your document</h3>
        <p className="text-sm text-ink-500 mb-8">This usually takes 10–30 seconds.</p>
        <div className="space-y-2.5 text-left">
          {STAGES.map((s, i) => {
            const Icon = s.icon
            const active = i === stage
            const done = i < stage
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all
                ${active ? 'bg-accent/10 text-accent-dark' : done ? 'text-ink-500' : 'text-ink-400'}`}>
                <Icon size={16} className={active ? 'animate-pulse' : ''} />
                <span className="text-sm font-medium">{s.label}</span>
              </div>
            )
          })}
        </div>
        {progress > 0 && (
          <div className="mt-6 w-full h-1 bg-ink-200 rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  )
}
