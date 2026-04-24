import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts'

export default function ReadinessGauge({ score = 0 }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#5b8def' : score >= 40 ? '#f59e0b' : '#ef4444'
  const data = [{ name: 'score', value: score, fill: color }]

  return (
    <div className="card p-6">
      <h3 className="font-display text-lg font-semibold text-ink-900 mb-1">Readiness Score</h3>
      <p className="text-xs text-ink-500 mb-3">Overall migration readiness</p>
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="75%" outerRadius="100%" barSize={18} data={data} startAngle={220} endAngle={-40}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: '#eceef2' }} dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="text-center">
            <div className="font-display text-5xl font-bold" style={{ color }}>{score}</div>
            <div className="text-xs text-ink-500 mt-1">out of 100</div>
          </div>
        </div>
      </div>
    </div>
  )
}
