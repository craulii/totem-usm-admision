import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import RegisterPage from './screens/RegisterPage'
import AdminPage from './screens/AdminPage'

// URL-based entry: the menu QR opens `?registro`; the admin link is
// `?admin=<token>`. The totem (no param) renders the normal app.
const params = new URLSearchParams(window.location.search)
const entry = params.has('admin')
  ? <AdminPage token={params.get('admin')} />
  : params.has('registro')
  ? <RegisterPage />
  : <App />

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {entry}
  </React.StrictMode>
)