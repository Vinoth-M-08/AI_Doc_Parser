import { CheckCircle2, AlertTriangle, XCircle, Wrench } from 'lucide-react'

const VERDICT_STYLES = {
  READY: { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success', icon: CheckCircle2, label: 'Ready for Migration' },
  READY_WITH_MINOR_CHANGES: { bg: 'bg-accent/10', border: 'border-accent/30', text: 'text-accent-dark', icon: Wrench, label: 'Ready with Minor Changes' },
  NEEDS_RESTRUCTURING: { bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning', icon: AlertTriangle, label: 'Needs Restructuring' },
  NOT_READY: { bg: 'bg-danger/10', border: 'border-danger/30', text: 'text-danger', icon: XCircle, label: 'Not Ready' },
}

export default function VerdictBanner({ verdict, score, summary }) {
  const style = VERDICT_STYLES[verdict] || VERDICT_STYLES.NEEDS_RESTRUCTURING
  const Icon = style.icon

  return (
    <div className={`card ${style.bg} ${style.border} p-8 animate-slide-up`}>
      <div className="flex items-start gap-5">
        <div className={`w-14 h-14 rounded-2xl bg-white grid place-items-center ${style.text}`}>
          <Icon size={28} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-xs uppercase tracking-widest font-semibold mb-1.5 ${style.text}`}>Migration Verdict</div>
          <h2 className="font-display text-2xl font-bold text-ink-900 mb-2">{style.label}</h2>
          <p className="text-ink-600 text-[15px] leading-relaxed max-w-2xl">{summary}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="stat-label mb-1">Score</div>
          <div className={`font-display text-4xl font-bold ${style.text}`}>{score}</div>
          <div className="text-xs text-ink-500">/ 100</div>
        </div>
      </div>
    </div>
  )
}
