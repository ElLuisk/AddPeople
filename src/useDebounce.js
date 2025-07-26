// src/useDebounce.js
import { useState, useEffect } from 'react';

// Este hook toma un valor (lo que el usuario escribe) y un delay en milisegundos
function useDebounce(value, delay) {
  // Estado para guardar el valor "debounced"
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Configura un temporizador para actualizar el valor debounced después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Función de limpieza: se ejecuta si el valor cambia antes de que termine el delay.
    // Cancela el temporizador anterior para que no se ejecuten búsquedas innecesarias.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo se vuelve a ejecutar si el valor o el delay cambian

  return debouncedValue;
}

export default useDebounce;