// --- INICIO DEL CÓDIGO COMPLETO PARA APP.JSX ---
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Toaster, toast } from 'react-hot-toast';
import Modal from 'react-modal';

import PersonaForm from './PersonaForm';
import PersonasList from './PersonasList';

const customModalStyles = {
  content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', marginRight: '-50%', transform: 'translate(-50%, -50%)', backgroundColor: '#1f2937', border: '1px solid #4b5563', borderRadius: '8px', padding: '2rem', color: 'white', width: '90%', maxWidth: '500px' },
  overlay: { backgroundColor: 'rgba(0, 0, 0, 0.75)' },
};

function App() {
  const [personas, setPersonas] = useState([]);
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [currentNombre, setCurrentNombre] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { getPersonas(); }, []);

  async function getPersonas() { setLoading(true); const { data, error } = await supabase.from('personas').select('*').order('created_at', { ascending: false }); if (error) toast.error('No se pudieron cargar los datos.'); else setPersonas(data); setLoading(false); }
  const openModal = (type, persona) => { setModalType(type); setSelectedPerson(persona); if (type === 'edit') setCurrentNombre(persona.nombre); setModalIsOpen(true); };
  const closeModal = () => { setModalIsOpen(false); setModalType(null); setSelectedPerson(null); setCurrentNombre(''); };
  const handleRegister = async (e) => { e.preventDefault(); if (!nombre.trim()) return; setIsProcessing(true); const { data, error } = await supabase.from('personas').insert([{ nombre: nombre.trim() }]).select(); if (error) toast.error('Error al registrar.'); else { toast.success('¡Persona registrada!'); setPersonas([data[0], ...personas]); setNombre(''); } setIsProcessing(false); };
  const handleDelete = async () => { if (!selectedPerson) return; setIsProcessing(true); const { error } = await supabase.from('personas').delete().eq('id', selectedPerson.id); if (error) toast.error('Error al eliminar.'); else { toast.success('Persona eliminada.'); setPersonas(personas.filter((p) => p.id !== selectedPerson.id)); closeModal(); } setIsProcessing(false); };
  const handleUpdate = async (e) => { e.preventDefault(); if (!selectedPerson || !currentNombre.trim()) return; setIsProcessing(true); const { data, error } = await supabase.from('personas').update({ nombre: currentNombre.trim() }).eq('id', selectedPerson.id).select(); if (error) toast.error('Error al actualizar.'); else { toast.success('Nombre actualizado.'); setPersonas(personas.map((p) => (p.id === selectedPerson.id ? data[0] : p))); closeModal(); } setIsProcessing(false); };

  const filteredPersonas = personas.filter((persona) => persona.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-8">
      <Toaster position="top-center" reverseOrder={false} />
      <h1 className="text-4xl font-bold mb-6">Registro de Personas</h1>
      <PersonaForm handleRegister={handleRegister} nombre={nombre} setNombre={setNombre} isProcessing={isProcessing} />
      <div className="w-full max-w-lg">
        <div className="mb-4">
          <input type="text" placeholder="Buscar por nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full px-4 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        <PersonasList personas={filteredPersonas} loading={loading} openModal={openModal} isProcessing={isProcessing} />
      </div>
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customModalStyles} contentLabel="Acción de Persona">
        {modalType === 'edit' && ( <form onSubmit={handleUpdate}> <h2 className="text-2xl font-bold mb-4">Editar Nombre</h2> <input type="text" value={currentNombre} onChange={(e) => setCurrentNombre(e.target.value)} autoFocus className="w-full px-4 py-2 rounded bg-gray-700 mb-6" /> <div className="flex justify-end gap-4"> <button type="button" onClick={closeModal} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500" disabled={isProcessing}>Cancelar</button> <button type="submit" className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500" disabled={isProcessing}>{isProcessing ? 'Guardando...' : 'Guardar'}</button> </div> </form> )}
        {modalType === 'delete' && ( <div> <h2 className="text-2xl font-bold mb-4">Confirmar Eliminación</h2> <p className="mb-6">¿Seguro que quieres eliminar a <strong className="font-bold text-purple-400">{selectedPerson?.nombre}</strong>?</p> <div className="flex justify-end gap-4"> <button onClick={closeModal} className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500" disabled={isProcessing}>Cancelar</button> <button onClick={handleDelete} className="px-4 py-2 rounded bg-red-600 hover:bg-red-500" disabled={isProcessing}>{isProcessing ? 'Eliminando...' : 'Sí, Eliminar'}</button> </div> </div> )}
      </Modal>
    </div>
  );
}
export default App;

// --- FIN DEL CÓDIGO COMPLETO PARA APP.JSX ---