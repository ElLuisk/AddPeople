// src/App.jsx

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Toaster, toast } from 'react-hot-toast';
import Modal from 'react-modal';

// Importando nuestros componentes refactorizados
import PersonaForm from './PersonaForm';
import PersonasList from './PersonasList';
import Pagination from './Pagination';

// Estilos para el modal, se mantienen igual
const customModalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#1f2937',
    border: '1px solid #4b5563',
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

const ITEMS_PER_PAGE = 5; // Constante para la paginación

function App() {
  // Estados de la aplicación
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Estados para formularios y búsqueda
  const [nombre, setNombre] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para modales
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [currentNombre, setCurrentNombre] = useState('');
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Efecto para cargar los datos iniciales y al cambiar de página
  useEffect(() => {
    getPersonas(currentPage);
  }, [currentPage]);

  // Función para obtener los datos de una página específica
  async function getPersonas(page) {
    setLoading(true);
    const from = page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error, count } = await supabase
      .from('personas')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      toast.error('No se pudieron cargar los datos.');
    } else {
      setPersonas(data);
      setTotalCount(count);
    }
    setLoading(false);
  }

  // Funciones para manejar los modales
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

  // Funciones CRUD (Create, Read, Update, Delete)
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setIsProcessing(true);
    const { data, error } = await supabase.from('personas').insert([{ nombre: nombre.trim() }]).select();
    
    if (error) {
      toast.error('Error al registrar la persona.');
    } else {
      toast.success('¡Persona registrada!');
      if (currentPage === 0) {
        getPersonas(0);
      } else {
        // Si no estamos en la primera página, simplemente actualizamos el conteo total
        setTotalCount(prevCount => prevCount + 1);
      }
      setNombre('');
    }
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    if (!selectedPerson) return;
    setIsProcessing(true);
    const { error } = await supabase.from('personas').delete().eq('id', selectedPerson.id);

    if (error) {
      toast.error('Error al eliminar la persona.');
    } else {
      toast.success('Persona eliminada.');
      // Recargar la página actual para reflejar los cambios
      getPersonas(currentPage);
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

    if (error) {
      toast.error('Error al actualizar el nombre.');
    } else {
      toast.success('Nombre actualizado.');
      // Actualizamos la lista local directamente para no tener que recargar
      setPersonas(personas.map((p) => (p.id === selectedPerson.id ? data[0] : p)));
      closeModal();
    }
    setIsProcessing(false);
  };

  // Función para manejar el cambio de página desde el componente Pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Filtrado de los resultados de la página actual
  const filteredPersonas = personas.filter((persona) =>
    persona.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-4xl font-bold mb-6">Registro de Personas</h1>
      
      <PersonaForm
        handleRegister={handleRegister}
        nombre={nombre}
        setNombre={setNombre}
        isProcessing={isProcessing}
      />
      
      <div className="w-full max-w-lg mt-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar en la página actual..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <PersonasList
          personas={filteredPersonas}
          loading={loading}
          openModal={openModal}
          isProcessing={isProcessing}
        />
        
        {!loading && totalCount > 0 && (
          <Pagination
            currentPage={currentPage}
            totalCount={totalCount}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
          />
        )}
      </div>
      
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customModalStyles} contentLabel="Acción de Persona">
        {modalType === 'edit' && (
          <form onSubmit={handleUpdate}>
            <h2 className="text-2xl font-bold mb-4">Editar Nombre</h2>
            <input
              type="text"
              value={currentNombre}
              onChange={(e) => setCurrentNombre(e.target.value)}
              autoFocus
              className="w-full px-4 py-2 rounded bg-gray-700 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex justify-end gap-4">
              <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 font-semibold" disabled={isProcessing}>
                Cancelar
              </button>
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
              <button onClick={closeModal} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 font-semibold" disabled={isProcessing}>
                Cancelar
              </button>
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