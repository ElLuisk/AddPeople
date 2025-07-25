// src/PersonasList.jsx
import React from 'react';
import PersonaItem from './PersonaItem';
import Spinner from './Spinner';

function PersonasList({ personas, loading, openModal, isProcessing }) {
  if (loading) {
    return <Spinner />;
  }

  if (personas.length === 0) {
    return <p className="text-gray-400">No hay personas registradas. ¡Añade la primera!</p>;
  }

  return (
    <ul className="space-y-3 w-full">
      {personas.map((persona) => (
        <PersonaItem
          key={persona.id}
          persona={persona}
          openModal={openModal}
          isProcessing={isProcessing}
        />
      ))}
    </ul>
  );
}

export default PersonasList;