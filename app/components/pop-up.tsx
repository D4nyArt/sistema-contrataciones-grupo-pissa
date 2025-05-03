/* DOCUMENTACIÓN - Pop-Up en la Pantalla

CLASIFICACIÓN
- aprobado: verde
- denegado: rojo
- errorSist: rojo oscuro
- info: azul
 
PROPIEDADES
tipo: clasificación
mensaje: ""
cierreAuto: si se cierra automáticamente (tiempo) **OPCIONAL**
tiempo: tiempo en ms para cerrar **OPCIONAL**
funCerrar: funcion que se ejecuta al cerrar **OPCIONAL**

USO DEL POPUP:
// Importar el popup y hooks necesarios
import { useState } from "react";
import PopUp from "../components/pop-up";

// Crear el hook del popup
const [isOpen, setIsOpen] = useState(false);

const openPopup = () => setIsOpen(true);
const closePopup = () => setIsOpen(false);

  return (
    <div>
      // En el botón que quieras que abra un popup y que su onClick sea openPopup
      <button onClick={openPopup}>Bloquear Usuario</button>

      // Usar show={isOpen} onClose={closePopup} como argumentos del <PopUp>
      <PopUp show={isOpen} onClose={closePopup}>
        // Aquí escribes lo que quieres que tenga el popup
        <h2 className="font-bold">Mi contenido personalizado</h2>
        <p>Este texto está dentro de la ventana emergente.</p>
      </PopUp>
    </div>
  );
}
*/

"use client";
import React from "react";

interface PopUpProps {
  show: boolean;
  onClose?: () => void;
  children: React.ReactNode;
}

export default function PopUp({ show, onClose, children }: PopUpProps) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded shadow-lg max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        {onClose && (
          <button
            className="mt-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
