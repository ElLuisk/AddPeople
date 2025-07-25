// src/PersonaForm.jsx
import React from 'react';

// Recibe las props necesarias de App.jsx
function PersonaForm({ handleRegister, nombre, setNombre, isProcessing }) {
  return (
    <form onSubmit={handleRegister} className="mb-8 flex gap-2 w-full max-w-lg">
      <input
        type="text"
        placeholder="Añadir nueva persona..."
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="flex-grow px-4 py-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
        disabled={isProcessing}
      >
        {isProcessing ? '...' : 'Registrar'}
      </button>
    </form>
  );
}

export default PersonaForm;