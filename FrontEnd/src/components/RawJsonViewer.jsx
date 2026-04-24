import { useState } from 'react'
import { Code2, ChevronDown, Copy, Check } from 'lucide-react'

export default function RawJsonViewer({ data }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(data, null, 2)

  const copyJson = async () => {
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="card overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-ink-50 transition-colors">
        <div className="flex items-center gap-2.5">
          <Code2 size={16} className="text-ink-500" />
          <span className="font-display font-semibold text-ink-900">Raw JSON Response</span>
        </div>
        <ChevronDown size={16} className={`text-ink-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-ink-200 relative">
          <button onClick={copyJson}
            className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white border border-ink-200 text-xs text-ink-600 hover:bg-ink-50">
            {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
          </button>
          <pre className="font-mono text-xs text-ink-700 p-5 overflow-auto max-h-96 bg-ink-50/50">
{json}
          </pre>
        </div>
      )}
    </div>
  )
}
