import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AnalysisProvider } from './context/AnalysisContext.jsx'
import { SettingsProvider } from './context/SettingsContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AnalysisProvider>
          <App />
        </AnalysisProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
)
