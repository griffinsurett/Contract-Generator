import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ClientContractView from './pages/ClientContractView.jsx'
import AdminAuth from './components/AdminAuth.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Admin route - password protected */}
        <Route path="/" element={
          <AdminAuth>
            <App />
          </AdminAuth>
        } />
        {/* Client signing route - no authentication required */}
        <Route path="/sign/:encodedData" element={<ClientContractView />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
