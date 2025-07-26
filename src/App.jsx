// (Pega todo lo que sigue en tu App.jsx)

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Modal from 'react-modal';
import PersonaForm from './PersonaForm';
import PersonasList from './PersonasList';
import Pagination from './Pagination';
import Spinner from './Spinner';
import useDebounce from './useDebounce';
import { FaSearch, FaTimes, FaFilter, FaSignOutAlt } from 'react-icons/fa';

const customModalStyles = {
  content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px', padding: '2rem', color: 'white', width: '90%', maxWidth: '500px' },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' },
};
const ITEMS_PER_PAGE = 5;

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [nombre, setNombre] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [currentNombre, setCurrentNombre] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/'); }
      else { setUser(session.user); }
    };
    checkUserSession();
  }, [navigate]);

  useEffect(() => { if (!user) return; if (currentPage !== 0) setCurrentPage(0); else getPersonas(0, debouncedSearchTerm); }, [debouncedSearchTerm, user]);
  useEffect(() => { if (!user) return; getPersonas(currentPage, debouncedSearchTerm); }, [currentPage, user]);
  
  async function getPersonas(page, searchTerm) {
    setLoading(true);
    const from = page * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    let query = supabase.from('personas').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(from, to);
    if (searchTerm) { query = query.ilike('nombre', `%${searchTerm}%`); }
    const { data, error, count } = await query;
    if (error) { toast.error('No se pudieron cargar los datos.'); }
    else { setPersonas(data); setTotalCount(count); }
    setLoading(false);
  }

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/'); };
  const openModal = (type, persona) => { setModalIsOpen(true); setModalType(type); setSelectedPerson(persona); if (type === 'edit') setCurrentNombre(persona.nombre); };
  const closeModal = () => { setModalIsOpen(false); setModalType(null); setSelectedPerson(null); setCurrentNombre(''); };
  const handleRegister = async (e) => { e.preventDefault(); if (!nombre.trim()) return; setIsProcessing(true); const { error } = await supabase.from('personas').insert([{ nombre: nombre.trim() }]); if (error) toast.error('Error al registrar.'); else { toast.success('¡Persona registrada!'); getPersonas(currentPage, debouncedSearchTerm); setNombre(''); } setIsProcessing(false); };
  const handleDelete = async () => { if (!selectedPerson) return; setIsProcessing(true); const { error } = await supabase.from('personas').delete().eq('id', selectedPerson.id); if (error) toast.error('Error al eliminar.'); else { toast.success('Persona eliminada.'); getPersonas(currentPage, debouncedSearchTerm); closeModal(); } setIsProcessing(false); };
  const handleUpdate = async (e) => { e.preventDefault(); if (!currentNombre.trim()) return; setIsProcessing(true); const { data, error } = await supabase.from('personas').update({ nombre: currentNombre.trim() }).eq('id', selectedPerson.id).select(); if (error) toast.error('Error al actualizar.'); else { toast.success('Nombre actualizado.'); setPersonas(personas.map(p => p.id === selectedPerson.id ? data[0] : p)); closeModal(); } setIsProcessing(false); };
  const handlePageChange = (newPage) => setCurrentPage(newPage);

  if (!user) { return (<div className="min-h-screen bg-gray-900 flex items-center justify-center"><Spinner /></div>); }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-8">
      <Toaster position="top-center" reverseOrder={false} />
      <header className="w-full max-w-lg flex justify-between items-center mb-6">
        <p className="text-sm text-gray-400 truncate">Sesión: <span className="font-bold text-gray-300">{user.email}</span></p>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm font-semibold transition-colors" aria-label="Cerrar sesión"><FaSignOutAlt /><span>Salir</span></button>
      </header>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6">Mis Personas</h1>
      <PersonaForm handleRegister={handleRegister} nombre={nombre} setNombre={setNombre} isProcessing={isProcessing} />
      <div className="w-full max-w-lg mt-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-grow"><span className="absolute inset-y-0 left-0 flex items-center pl-3"><FaSearch className="text-gray-500" /></span><input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-10 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500" />{searchTerm && (<button onClick={() => setSearchTerm('')} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-white" aria-label="Limpiar búsqueda"><FaTimes /></button>)}</div>
          <button onClick={() => toast('Funcionalidad de filtros avanzados próximamente!')} className="p-3 rounded bg-gray-700 hover:bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-purple-500" aria-label="Filtros avanzados"><FaFilter /></button>
        </div>
        <PersonasList personas={personas} loading={loading} openModal={openModal} isProcessing={isProcessing} />
        {!loading && totalCount > 0 && (<Pagination currentPage={currentPage} totalCount={totalCount} itemsPerPage={ITEMS_PER_PAGE} onPageChange={handlePageChange} />)}
      </div>
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customModalStyles} contentLabel="Acción de Persona">{modalType === 'edit' && ( <form onSubmit={handleUpdate}><h2 className="text-2xl font-bold mb-4">Editar Nombre</h2><input type="text" value={currentNombre} onChange={(e) => setCurrentNombre(e.target.value)} autoFocus className="w-full px-4 py-2 rounded bg-gray-700 mb-6" /><div className="flex justify-end gap-4"><button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500" disabled={isProcessing}>Cancelar</button><button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500" disabled={isProcessing}>{isProcessing ? 'Guardando...' : 'Guardar'}</button></div></form> )}{modalType === 'delete' && ( <div><h2 className="text-2xl font-bold mb-4">Confirmar Eliminación</h2><p className="mb-6">¿Seguro que quieres eliminar a <strong className="font-bold text-purple-400">{selectedPerson?.nombre}</strong>?</p><div className="flex justify-end gap-4"><button onClick={closeModal} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500" disabled={isProcessing}>Cancelar</button><button onClick={handleDelete} className="px-4 py-2 rounded bg-red-600 hover:bg-red-500" disabled={isProcessing}>{isProcessing ? 'Eliminando...' : 'Sí, Eliminar'}</button></div></div> )}</Modal>
    </div>
  );
}

export default App;
// --- FIN CÓDIGO COMPLETO Y FINAL DE App.jsx ---