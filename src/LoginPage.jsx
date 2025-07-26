// src/LoginPage.jsx
import { supabase } from './supabaseClient';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Escuchamos los cambios en el estado de autenticación de Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          // Si el usuario inicia sesión (o ya tiene una sesión activa),
          // lo redirigimos a la página principal de la aplicación.
          navigate('/app');
        } else {
          // Si el usuario cierra sesión o la sesión expira,
          // nos aseguramos de que esté en la página de login.
          navigate('/');
        }
      }
    );

    // Es una buena práctica limpiar el "listener" cuando el componente se destruye
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white text-center mb-6">Acceder a la App</h1>
        <p className="text-center text-gray-400 mb-8">Inicia sesión o crea una cuenta para continuar</p>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google']}
          theme="dark"
          // --> LA CORRECCIÓN ESTÁ AQUÍ. Se eliminaron los "..."
          localization={{
            variables: {
              sign_in: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                button_label: 'Iniciar Sesión'
              },
              sign_up: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                button_label: 'Crear Cuenta'
              },
              forgotten_password: {
                email_label: 'Correo electrónico',
                button_label: 'Enviar instrucciones'
              },
              magic_link: {
                email_label: 'Correo electrónico',
                button_label: 'Enviar enlace mágico'
              }
            }
          }}
        />
      </div>
    </div>
  );
}

export default LoginPage;