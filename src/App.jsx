// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Importamos nuestro cliente

function App() {
  const [personas, setPersonas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Función para obtener las personas de la base de datos
    async function getPersonas() {
      setLoading(true);
      const { data, error } = await supabase
        .from('personas')
        .select('*') // Selecciona todas las columnas
        .order('created_at', { ascending: false }); // Las más nuevas primero

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setPersonas(data);
      }
      setLoading(false);
    }

    getPersonas();
  }, []); // El array vacío significa que se ejecuta solo una vez, al montar el componente

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return; // No hacer nada si el nombre está vacío

    const { data, error } = await supabase
      .from('personas')
      .insert([{ nombre: nombre.trim() }])
      .select();

    if (error) {
      console.error('Error inserting data:', error);
    } else if (data) {
      // Añade la nueva persona a la lista sin tener que recargar todo
      setPersonas([data[0], ...personas]);
      setNombre(''); // Limpia el campo del formulario
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-6">Registro de Personas</h1>

      <form onSubmit={handleSubmit} className="mb-8 flex gap-2">
        <input
          type="text"
          placeholder="Nombre de la persona"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold">
          Registrar
        </button>
      </form>

      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Personas Registradas:</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <ul className="space-y-2">
            {personas.map((persona) => (
              <li key={persona.id} className="bg-gray-800 p-3 rounded">
                {persona.nombre}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;