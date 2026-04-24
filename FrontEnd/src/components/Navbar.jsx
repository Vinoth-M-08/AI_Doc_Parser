import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FileSearch, RotateCcw } from 'lucide-react'
import { useAnalysis } from '../context/AnalysisContext.jsx'
import SettingsMenu from './SettingsMenu.jsx'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { analysis, reset } = useAnalysis()
  const onDashboard = location.pathname === '/dashboard'

  const handleReset = () => {
    reset()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-ink-50/80 border-b border-ink-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-ink-900 text-white grid place-items-center group-hover:rotate-3 transition-transform">
            <FileSearch size={18} />
          </div>
          <div>
            <div className="font-display font-bold text-ink-900 leading-none">DocReady</div>
            <div className="text-[10px] uppercase tracking-widest text-ink-500 mt-0.5">Migration Readiness</div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {onDashboard && analysis && (
            <button onClick={handleReset} className="btn-secondary">
              <RotateCcw size={14} />
              Analyze another
            </button>
          )}
          <SettingsMenu />
        </div>
      </div>
    </header>
  )
}
