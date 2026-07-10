import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import RegisterPage from './screens/RegisterPage'

// The menu QR points to `?registro`. On the phone that renders the registration
// page; the totem (no param) renders the normal app.
const isRegistro = new URLSearchParams(window.location.search).has('registro')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isRegistro ? <RegisterPage /> : <App />}
  </React.StrictMode>
)