// src/App.jsx
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Toaster, toast } from 'react-hot-toast';
import Spinner from './Spinner';
import Modal from 'react-modal'; // --> Importamos react-modal
import { FaEdit, FaTrash } from 'react-icons/fa'; // --> Importamos los iconos

// --- Estilos personalizados para el modal (usando Tailwind) ---
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1f2937', // bg-gray-800
    border: '1px solid #4b5563', // border-gray-600
    borderRadius: '8px',
    padding: '2rem',
    color: 'white',
    width: '90%',
    maxWidth: '500px',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
};

function App() {
  // Estados existentes
  const [personas, setPersonas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- NUEVOS ESTADOS PARA LOS MODALES ---
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'edit' o 'delete'
  const [selectedPerson, setSelectedPerson] = useState(null); // La persona sobre la que actuamos
  const [currentNombre, setCurrentNombre] = useState(''); // El nombre en el input del modal de edición

  // --- ELIMINAMOS ESTADOS DE EDICIÓN EN LÍNEA ---
  // const [editingId, setEditingId] = useState(null);
  // const [editingNombre, setEditingNombre] = useState('');

  // --- Funciones para abrir y cerrar el modal ---
  const openModal = (type, persona) => {
    setModalType(type);
    setSelectedPerson(persona);
    if (type === 'edit') {
      setCurrentNombre(persona.nombre);
    }
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setModalType(null);
    setSelectedPerson(null);
    setCurrentNombre('');
  };

  // ... (useEffect para getPersonas no cambia)
  useEffect(() => {
    getPersonas();
  }, []);
  
  async function getPersonas() {
    setLoading(true);
    const { data, error } = await supabase.from('personas').select('*').order('created_at', { ascending: false });
    if (error) toast.error('No se pudieron cargar los datos.');
    else setPersonas(data);
    setLoading(false);
  }

  // --- Las funciones de manejo de datos ahora usan el estado del modal ---
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setIsProcessing(true);
    const { data, error } = await supabase.from('personas').insert([{ nombre: nombre.trim() }]).select();
    if (error) toast.error('Error al registrar.');
    else {
      toast.success('¡Persona registrada!');
      setPersonas([data[0], ...personas]);
      setNombre('');
    }
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    if (!selectedPerson) return;
    setIsProcessing(true);
    const { error } = await supabase.from('personas').delete().eq('id', selectedPerson.id);
    if (error) toast.error('Error al eliminar.');
    else {
      toast.success('Persona eliminada.');
      setPersonas(personas.filter((p) => p.id !== selectedPerson.id));
      closeModal();
    }
    setIsProcessing(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPerson || !currentNombre.trim()) return;
    setIsProcessing(true);
    const { data, error } = await supabase
      .from('personas')
      .update({ nombre: currentNombre.trim() })
      .eq('id', selectedPerson.id)
      .select();

    if (error) toast.error('Error al actualizar.');
    else {
      toast.success('Nombre actualizado.');
      setPersonas(personas.map((p) => (p.id === selectedPerson.id ? data[0] : p)));
      closeModal();
    }
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-4xl font-bold mb-6">Registro de Personas</h1>

      {/* Formulario de registro no cambia */}
      <form onSubmit={handleRegister} className="mb-8 flex gap-2">
        <input type="text" placeholder="Nombre de la persona" value={nombre} onChange={(e) => setNombre(e.target.value)} className="px-4 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold disabled:bg-gray-500" disabled={isProcessing}>
          {isProcessing ? '... ' : 'Registrar'}
        </button>
      </form>

      {/* Lista de Personas */}
      <div className="w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-4">Personas Registradas:</h2>
        {loading ? <Spinner /> : (
          <ul className="space-y-3">
            {personas.map((persona) => (
              <li key={persona.id} className="bg-gray-800 p-3 rounded flex items-center justify-between transition-all hover:bg-gray-700">
                <span className="flex-grow">{persona.nombre}</span>
                <div className="flex gap-4 ml-4">
                  <button onClick={() => openModal('edit', persona)} className="text-blue-400 hover:text-blue-300 text-lg" disabled={isProcessing} aria-label="Editar">
                    <FaEdit />
                  </button>
                  <button onClick={() => openModal('delete', persona)} className="text-red-400 hover:text-red-300 text-lg" disabled={isProcessing} aria-label="Eliminar">
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- EL MODAL --- */}
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customModalStyles} contentLabel="Acción de Persona">
        {modalType === 'edit' && (
          <form onSubmit={handleUpdate}>
            <h2 className="text-2xl font-bold mb-4">Editar Nombre</h2>
            <input type="text" value={currentNombre} onChange={(e) => setCurrentNombre(e.target.value)} autoFocus className="w-full px-4 py-2 rounded bg-gray-700 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <div className="flex justify-end gap-4">
              <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 font-semibold" disabled={isProcessing}>Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 font-semibold" disabled={isProcessing}>
                {isProcessing ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        )}
        {modalType === 'delete' && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Confirmar Eliminación</h2>
            <p className="mb-6">¿Estás seguro de que quieres eliminar a <strong className="font-bold text-purple-400">{selectedPerson?.nombre}</strong>? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-4">
              <button onClick={closeModal} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 font-semibold" disabled={isProcessing}>Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 font-semibold" disabled={isProcessing}>
                {isProcessing ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default App;