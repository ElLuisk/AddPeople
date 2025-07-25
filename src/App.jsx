// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [personas, setPersonas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);

  // --- NUEVO ESTADO PARA LA EDICIÓN ---
  const [editingId, setEditingId] = useState(null); // ID de la persona que estamos editando
  const [editingNombre, setEditingNombre] = useState(''); // Texto del nombre mientras se edita

  // Función para obtener las personas (sin cambios)
  useEffect(() => {
    async function getPersonas() {
      setLoading(true);
      const { data, error } = await supabase
        .from('personas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        setPersonas(data);
      }
      setLoading(false);
    }
    getPersonas();
  }, []);

  // Función para registrar una nueva persona (sin cambios)
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const { data, error } = await supabase
      .from('personas')
      .insert([{ nombre: nombre.trim() }])
      .select();

    if (error) {
      console.error('Error inserting data:', error);
    } else if (data) {
      setPersonas([data[0], ...personas]);
      setNombre('');
    }
  };

  // --- NUEVA FUNCIÓN PARA ELIMINAR ---
  const handleDelete = async (id) => {
    // Pedimos confirmación al usuario
    if (window.confirm("¿Estás seguro de que quieres eliminar a esta persona?")) {
      const { error } = await supabase
        .from('personas')
        .delete()
        .eq('id', id); // Elimina la fila donde el 'id' coincida

      if (error) {
        console.error('Error deleting data:', error);
      } else {
        // Filtra la persona eliminada del estado local para actualizar la UI al instante
        setPersonas(personas.filter((p) => p.id !== id));
      }
    }
  };

  // --- NUEVA FUNCIÓN PARA GUARDAR LA EDICIÓN ---
  const handleUpdate = async (id) => {
    const { data, error } = await supabase
      .from('personas')
      .update({ nombre: editingNombre.trim() }) // Actualiza la columna 'nombre'
      .eq('id', id) // Donde el 'id' coincida
      .select();

    if (error) {
      console.error('Error updating data:', error);
    } else if (data) {
      // Actualiza la lista de personas con el dato modificado
      setPersonas(personas.map((p) => (p.id === id ? data[0] : p)));
      setEditingId(null); // Salimos del modo edición
      setEditingNombre('');
    }
  };

  // --- NUEVA FUNCIÓN PARA INICIAR LA EDICIÓN ---
  const startEditing = (persona) => {
    setEditingId(persona.id);

    setEditingNombre(persona.nombre);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-6">Registro de Personas</h1>

      <form onSubmit={handleRegister} className="mb-8 flex gap-2">
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

      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Personas Registradas:</h2>
        {loading ? (
          <p>Cargando...</p>
        ) : (
          <ul className="space-y-3">
            {personas.map((persona) => (
              <li key={persona.id} className="bg-gray-800 p-3 rounded flex items-center justify-between">
                {/* --- LÓGICA DE RENDERIZADO: MODO VISTA O MODO EDICIÓN --- */}
                {editingId === persona.id ? (
                  // MODO EDICIÓN
                  <input
                    type="text"
                    value={editingNombre}
                    onChange={(e) => setEditingNombre(e.target.value)}
                    autoFocus
                    className="flex-grow bg-gray-600 px-2 py-1 rounded"
                  />
                ) : (
                  // MODO VISTA
                  <span className="flex-grow">{persona.nombre}</span>
                )}
                
                <div className="flex gap-2 ml-4">
                  {editingId === persona.id ? (
                    // Botones en MODO EDICIÓN
                    <>
                      <button onClick={() => handleUpdate(persona.id)} className="text-green-400 hover:text-green-300">Guardar</button>
                      <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-300">Cancelar</button>
                    </>
                  ) : (
                    // Botones en MODO VISTA
                    <>
                      <button onClick={() => startEditing(persona)} className="text-blue-400 hover:text-blue-300">Editar</button>
                      <button onClick={() => handleDelete(persona.id)} className="text-red-400 hover:text-red-300">Eliminar</button>
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