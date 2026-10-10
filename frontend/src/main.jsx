import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#161b30',
            color: '#e2e8f0',
            border: '1px solid rgba(59,100,255,0.2)',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: '#0a0c14' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#0a0c14' },
          },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
