// src/Pagination.jsx
import React from 'react';

function Pagination({ currentPage, totalCount, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // No mostrar nada si solo hay una página o menos
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex items-center justify-between mt-4 w-full">
      <button
        onClick={handlePrevious}
        disabled={currentPage === 0}
        className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 font-semibold disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        Anterior
      </button>

      <span className="text-gray-400">
        Página {currentPage + 1} de {totalPages}
      </span>

      <button
        onClick={handleNext}
        disabled={currentPage >= totalPages - 1}
        className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 font-semibold disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        Siguiente
      </button>
    </div>
  );
}

export default Pagination;