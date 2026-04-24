import { Heading, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function StructureTree({ structure }) {
  if (!structure) return null

  const hierarchy = structure.headingHierarchy || []
  const hasIssues = !structure.hasConsistentHierarchy
    || (structure.orphanHeadings?.length > 0)
    || structure.longParagraphs > 0
    || structure.emptyHeadings > 0

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink-900">Document Structure</h3>
          <p className="text-xs text-ink-500 mt-0.5">Heading hierarchy & integrity</p>
        </div>
        {hasIssues ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning/10 text-warning text-xs font-medium">
            <AlertTriangle size={12} />
            Issues found
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 text-success text-xs font-medium">
            <CheckCircle2 size={12} />
            Looks good
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <IntegrityPill ok={structure.hasConsistentHierarchy} label="Hierarchy" />
        <IntegrityPill ok={!structure.orphanHeadings?.length} label={`Orphans (${structure.orphanHeadings?.length ?? 0})`} />
        <IntegrityPill ok={(structure.longParagraphs ?? 0) === 0} label={`Long paras (${structure.longParagraphs ?? 0})`} />
        <IntegrityPill ok={(structure.emptyHeadings ?? 0) === 0} label={`Empty (${structure.emptyHeadings ?? 0})`} />
      </div>

      {hierarchy.length > 0 ? (
        <div className="max-h-72 overflow-y-auto pr-2 space-y-1">
          {hierarchy.map((h, i) => (
            <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-ink-50 text-sm"
              style={{ paddingLeft: `${(h.level - 1) * 16 + 8}px` }}>
              <Heading size={12} className="text-ink-400 shrink-0" />
              <span className="text-ink-400 text-xs font-mono shrink-0">H{h.level}</span>
              <span className="text-ink-800 truncate">{h.text}</span>
              {h.wordsUnder != null && (
                <span className="ml-auto text-xs text-ink-400 shrink-0">{h.wordsUnder}w</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-ink-500 italic text-center py-8">No headings detected in this document.</div>
      )}
    </div>
  )
}

function IntegrityPill({ ok, label }) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs
      ${ok ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
      {ok ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
      <span className="font-medium">{label}</span>
    </div>
  )
}
