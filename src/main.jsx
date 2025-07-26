// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import Modal from 'react-modal';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Importamos el componente de la página de Login que crearemos a continuación
import LoginPage from './LoginPage.jsx';

// Vinculamos el modal al elemento raíz de la app para accesibilidad
Modal.setAppElement('#root');

// Aquí definimos las rutas de nuestra aplicación
const router = createBrowserRouter([
  {
    path: '/', // La ruta raíz (ej. https://misitio.com/) será la página de Login
    element: <LoginPage />,
  },
  {
    path: '/app', // La ruta de la aplicación principal (ej. https://misitio.com/app)
    element: <App />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* En lugar de renderizar <App />, ahora renderizamos el proveedor de rutas */}
    <RouterProvider router={router} />
  </React.StrictMode>
);