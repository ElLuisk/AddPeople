// src/Spinner.jsx
import React from 'react';

const Spinner = () => {
  return (
    <div className="flex justify-center items-center p-4">
      <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-purple-400"></div>
    </div>
  );
};

export default Spinner;