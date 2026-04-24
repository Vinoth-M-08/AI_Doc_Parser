import { Download } from 'lucide-react'

export default function ExportButton({ data, fileName = 'analysis' }) {
  const handleExport = () => {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName.replace(/\.[^.]+$/, '')}-analysis.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <button onClick={handleExport} className="btn-primary">
      <Download size={14} />
      Export Report
    </button>
  )
}
