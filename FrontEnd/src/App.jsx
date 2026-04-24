import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar.jsx'
import UploadPage from './pages/UploadPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontSize: 13, borderRadius: 10, padding: '10px 14px' },
          success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
          error: { iconTheme: { primary: '#ef4444', secondary: 'white' }, duration: 6000 },
        }}
      />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
