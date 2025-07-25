// src/PersonaItem.jsx
import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

function PersonaItem({ persona, openModal, isProcessing }) {
  return (
    <li className="bg-gray-800 p-3 rounded flex items-center justify-between transition-all hover:bg-gray-700">
      <span className="flex-grow">{persona.nombre}</span>
      <div className="flex gap-4 ml-4">
        <button
          onClick={() => openModal('edit', persona)}
          className="text-blue-400 hover:text-blue-300 text-lg disabled:text-gray-600"
          disabled={isProcessing}
          aria-label={`Editar a ${persona.nombre}`}
        >
          <FaEdit />
        </button>
        <button
          onClick={() => openModal('delete', persona)}
          className="text-red-400 hover:text-red-300 text-lg disabled:text-gray-600"
          disabled={isProcessing}
          aria-label={`Eliminar a ${persona.nombre}`}
        >
          <FaTrash />
        </button>
      </div>
    </li>
  );
}

export default PersonaItem;