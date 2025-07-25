// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Toaster, toast } from 'react-hot-toast'; // --> 1. Importar Toaster y toast
import Spinner from './Spinner'; // --> 2. Importar nuestro nuevo Spinner

function App() {
  const [personas, setPersonas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingNombre, setEditingNombre] = useState('');
  
  // --> 3. Nuevo estado para deshabilitar botones
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function getPersonas() {
      // No necesitamos setIsProcessing aquí porque es una carga inicial
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching data:', error);
        toast.error('No se pudieron cargar los datos.'); // --> Notificación de error de carga
      } else {
        setPersonas(data);
      }
      setLoading(false);
    }
    getPersonas();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setIsProcessing(true); // --> Deshabilitar botones
    const { data, error } = await supabase
      .from('personas')
      .insert([{ nombre: nombre.trim() }])
      .select();

    if (error) {
      toast.error('Error al registrar la persona.'); // --> Notificación de error
    } else if (data) {
      toast.success('¡Persona registrada con éxito!'); // --> Notificación de éxito
      setPersonas([data[0], ...personas]);
      setNombre('');
    }
    setIsProcessing(false); // --> Habilitar botones de nuevo
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar a esta persona?")) {
      setIsProcessing(true);
      const { error } = await supabase
        .from('personas')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Error al eliminar la persona.');
      } else {
        toast.success('Persona eliminada.');
        setPersonas(personas.filter((p) => p.id !== id));
      }
      setIsProcessing(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editingNombre.trim()) {
      toast.error('El nombre no puede estar vacío.');
      return;
    }
    setIsProcessing(true);
    const { data, error } = await supabase
      .from('personas')
      .update({ nombre: editingNombre.trim() })
      .eq('id', id)
      .select();

    if (error) {
      toast.error('Error al actualizar el nombre.');
    } else if (data) {
      toast.success('Nombre actualizado.');
      setPersonas(personas.map((p) => (p.id === id ? data[0] : p)));
      setEditingId(null);
      setEditingNombre('');
    }
    setIsProcessing(false);
  };

  const startEditing = (persona) => {
    setEditingId(persona.id);
    setEditingNombre(persona.nombre);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <Toaster position="top-center" reverseOrder={false} /> {/* --> 4. Añadir el componente Toaster */}

      <h1 className="text-4xl font-bold mb-6">Registro de Personas</h1>

      <form onSubmit={handleRegister} className="mb-8 flex gap-2">
        <input
          type="text"
          placeholder="Nombre de la persona"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="px-4 py-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
          disabled={isProcessing} // --> 5. Deshabilitar botón
        >
          {isProcessing ? 'Registrando...' : 'Registrar'}
        </button>
      </form>

      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Personas Registradas:</h2>
        {loading ? (
          <Spinner /> // --> 6. Usar el componente Spinner
        ) : (
          <ul className="space-y-3">
            {personas.map((persona) => (
              <li key={persona.id} className="bg-gray-800 p-3 rounded flex items-center justify-between">
                {editingId === persona.id ? (
                  <input
                    type="text"
                    value={editingNombre}
                    onChange={(e) => setEditingNombre(e.target.value)}
                    autoFocus
                    className="flex-grow bg-gray-600 px-2 py-1 rounded"
                  />
                ) : (
                  <span className="flex-grow">{persona.nombre}</span>
                )}
                
                <div className="flex gap-2 ml-4">
                  {editingId === persona.id ? (
                    <>
                      <button onClick={() => handleUpdate(persona.id)} className="text-green-400 hover:text-green-300 disabled:text-gray-500" disabled={isProcessing}>Guardar</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-300 disabled:text-gray-500" disabled={isProcessing}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditing(persona)} className="text-blue-400 hover:text-blue-300 disabled:text-gray-500" disabled={isProcessing}>Editar</button>
                      <button onClick={() => handleDelete(persona.id)} className="text-red-400 hover:text-red-300 disabled:text-gray-500" disabled={isProcessing}>Eliminar</button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;