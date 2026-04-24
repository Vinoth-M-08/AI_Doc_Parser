import { FileText, Hash, Type, Heading, Image, Table, Link2, List } from 'lucide-react'

const METRIC_CONFIG = [
  { key: 'wordCount', label: 'Words', icon: Type, format: (v) => v?.toLocaleString() },
  { key: 'totalPages', label: 'Pages', icon: FileText },
  { key: 'paragraphCount', label: 'Paragraphs', icon: Hash },
  { key: 'headingCount', label: 'Headings', icon: Heading },
  { key: 'imageCount', label: 'Images', icon: Image },
  { key: 'tableCount', label: 'Tables', icon: Table },
  { key: 'hyperlinkCount', label: 'Links', icon: Link2 },
  { key: 'listCount', label: 'Lists', icon: List },
]

export default function MetricsGrid({ metrics }) {
  if (!metrics) return null

  return (
    <div>
      <h3 className="font-display text-lg font-semibold text-ink-900 mb-4">Document Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {METRIC_CONFIG.map(({ key, label, icon: Icon, format }) => {
          const raw = metrics[key]
          const value = raw == null ? '—' : (format ? format(raw) : raw)
          return (
            <div key={key} className="card card-hover p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="stat-label">{label}</div>
                <Icon size={14} className="text-ink-400" />
              </div>
              <div className="font-display text-2xl font-bold text-ink-900">{value}</div>
            </div>
          )
        })}
      </div>
      {metrics.avgWordsPerParagraph != null && (
        <div className="mt-3 text-xs text-ink-500 pl-1">
          Avg <span className="font-medium text-ink-700">{metrics.avgWordsPerParagraph.toFixed(1)}</span> words per paragraph
          {metrics.sectionCount != null && <> · <span className="font-medium text-ink-700">{metrics.sectionCount}</span> sections</>}
        </div>
      )}
    </div>
  )
}
