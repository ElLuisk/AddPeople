// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import Modal from 'react-modal'; // --> 1. Importa Modal

Modal.setAppElement('#root'); // --> 2. Vincula el modal al elemento raíz de tu app

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)