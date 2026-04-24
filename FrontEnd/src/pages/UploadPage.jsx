import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ShieldCheck, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import FileDropzone from '../components/FileDropzone.jsx'
import LoadingScreen from '../components/LoadingScreen.jsx'
import { analyzeDocument } from '../api/analysisApi.js'
import { useAnalysis } from '../context/AnalysisContext.jsx'
import { useSettings } from '../context/SettingsContext.jsx'

export default function UploadPage() {
  const navigate = useNavigate()
  const { setAnalysis, setFileMeta } = useAnalysis()
  const { useAi, model, defaultModel, geminiConfigured } = useSettings()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const handleFile = async (file) => {
    setError(null)
    setLoading(true)
    setProgress(0)
    setFileMeta({ name: file.name, size: file.size, type: file.name.split('.').pop().toUpperCase() })

    const requestedAi = geminiConfigured && useAi
    const requestedModel = model || defaultModel

    try {
      const data = await analyzeDocument(file, {
        useAi: requestedAi,
        model: requestedAi ? requestedModel : undefined,
        onProgress: setProgress,
      })
      setAnalysis(data)

      if (requestedAi && data.analyzer !== 'gemini') {
        const summary = data.aiAnalysis?.summary || 'Gemini call failed.'
        toast.error(
          `Model "${requestedModel}" failed — using heuristic.\n${summary}`,
          { duration: 6000, style: { maxWidth: 480 } }
        )
      } else if (data.analyzer === 'gemini') {
        toast.success(`Analyzed with ${data.model || requestedModel}`)
      }

      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || err.message || 'Something went wrong.'
      setError(msg)
      toast.error(msg)
      setLoading(false)
    }
  }

  if (loading) return <LoadingScreen progress={progress} />

  const aiActive = geminiConfigured && useAi
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div className="text-center mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-900/5 border border-ink-900/10 text-xs text-ink-700 mb-5">
          <Sparkles size={12} className={aiActive ? 'text-accent' : 'text-ink-400'} />
          {aiActive ? 'AI-powered by Gemini' : 'Heuristic analyzer (toggle Gemini in Settings)'}
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-ink-900 mb-4 leading-[1.1]">
          Is your document<br />
          <span className="text-accent">ready to migrate?</span>
        </h1>
        <p className="text-ink-600 text-lg max-w-xl mx-auto">
          Upload a Word or PDF document. Get instant structural analysis, readability scoring, and actionable migration recommendations.
        </p>
      </div>

      <div className="mb-6 animate-slide-up">
        <FileDropzone onFile={handleFile} disabled={loading} />
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mt-10">
        <FeatureCard icon={Zap} title="Instant Metrics" text="Pages, words, headings, tables, images — extracted in seconds." />
        <FeatureCard icon={Sparkles} title="AI Readability" text="Gemini evaluates clarity, structure, and complexity." />
        <FeatureCard icon={ShieldCheck} title="Migration Score" text="Know if it's ready before moving to Document360." />
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, text }) {
  return (
    <div className="card card-hover p-5">
      <div className="w-9 h-9 rounded-lg bg-ink-900 text-white grid place-items-center mb-3">
        <Icon size={16} />
      </div>
      <div className="font-display font-semibold text-ink-900 mb-1">{title}</div>
      <p className="text-sm text-ink-600 leading-relaxed">{text}</p>
    </div>
  )
}
