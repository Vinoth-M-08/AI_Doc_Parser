import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'

export default function ReadabilityChart({ aiAnalysis }) {
  if (!aiAnalysis) return null

  const readabilityScore = aiAnalysis.readabilityLevel === 'Easy' ? 9
    : aiAnalysis.readabilityLevel === 'Medium' ? 6.5
    : aiAnalysis.readabilityLevel === 'Complex' ? 4 : 5

  const data = [
    { dimension: 'Clarity', value: aiAnalysis.contentClarity ?? 0 },
    { dimension: 'Structure', value: aiAnalysis.structuralQuality ?? 0 },
    { dimension: 'Readability', value: readabilityScore },
    { dimension: 'Readiness', value: (aiAnalysis.readinessScore ?? 0) / 10 },
  ]

  return (
    <div className="card p-6">
      <h3 className="font-display text-lg font-semibold text-ink-900 mb-1">Quality Dimensions</h3>
      <p className="text-xs text-ink-500 mb-3">Scored 0–10</p>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#d5dae3" />
            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#4d5668', fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
            <Radar dataKey="value" stroke="#5b8def" fill="#5b8def" fillOpacity={0.3} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-xs">
        <span className="stat-label">Readability:</span>
        <span className="font-medium text-ink-900">{aiAnalysis.readabilityLevel || '—'}</span>
      </div>
    </div>
  )
}
