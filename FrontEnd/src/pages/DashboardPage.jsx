import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Sparkles, Cpu } from 'lucide-react'
import { useAnalysis } from '../context/AnalysisContext.jsx'
import VerdictBanner from '../components/VerdictBanner.jsx'
import MetricsGrid from '../components/MetricsGrid.jsx'
import ReadinessGauge from '../components/ReadinessGauge.jsx'
import ReadabilityChart from '../components/ReadabilityChart.jsx'
import StructureTree from '../components/StructureTree.jsx'
import SuggestionsList from '../components/SuggestionsList.jsx'
import RawJsonViewer from '../components/RawJsonViewer.jsx'
import ExportButton from '../components/ExportButton.jsx'

function formatSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { analysis, fileMeta } = useAnalysis()

  useEffect(() => {
    if (!analysis) navigate('/', { replace: true })
  }, [analysis, navigate])

  if (!analysis) return null

  const { metrics, structure, aiAnalysis, verdict, fileName, fileType, fileSizeKb, analyzer } = analysis
  const aiBadge = analyzer === 'gemini'
    ? { label: 'Gemini AI', className: 'bg-accent/10 text-accent-dark border-accent/30', Icon: Sparkles }
    : { label: 'Heuristic', className: 'bg-ink-100 text-ink-600 border-ink-200', Icon: Cpu }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-ink-900 text-white grid place-items-center">
            <FileText size={20} />
          </div>
          <div>
            <div className="font-display font-semibold text-ink-900 truncate max-w-[60vw]">
              {fileName || fileMeta?.name || 'Document'}
            </div>
            <div className="text-xs text-ink-500 mt-0.5 flex items-center gap-2">
              <span className="font-mono">{fileType || fileMeta?.type || '—'}</span>
              <span>·</span>
              <span>{fileSizeKb ? `${fileSizeKb} KB` : formatSize(fileMeta?.size)}</span>
              <span>·</span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-semibold ${aiBadge.className}`}>
                <aiBadge.Icon size={10} />
                {aiBadge.label}
              </span>
            </div>
          </div>
        </div>
        <ExportButton data={analysis} fileName={fileName || fileMeta?.name} />
      </div>

      <VerdictBanner
        verdict={aiAnalysis?.migrationReadiness}
        score={aiAnalysis?.readinessScore ?? 0}
        summary={verdict?.oneLineSummary || aiAnalysis?.summary || ''}
      />

      <MetricsGrid metrics={metrics} />

      <div className="grid md:grid-cols-2 gap-5">
        <ReadinessGauge score={aiAnalysis?.readinessScore ?? 0} />
        <ReadabilityChart aiAnalysis={aiAnalysis} />
      </div>

      <StructureTree structure={structure} />
      <SuggestionsList aiAnalysis={aiAnalysis} analyzer={analyzer} />
      <RawJsonViewer data={analysis} />
    </div>
  )
}
