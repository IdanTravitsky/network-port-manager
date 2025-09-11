import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // <-- CHANGE THIS BACK to index.css

ReactDOM.createRoot(document.getElementById('root')).render(
  import.meta.env.MODE !== 'production' ? (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  ) : (
    <App />
  ),
)
