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
import { useState } from "react";

interface PopUpProps {
  children?: React.ReactNode;
}

export default function PopUp({ children }: PopUpProps) {
  const [show, setShow] = useState(true);

  if (!show) {
    return null;
  }

  const onClose = () => {
    setShow(false);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-xl relative max-w-sm w-full">
        {children ?? (
          <>
            <h3 className="text-lg font-bold mb-4">Este es el popup</h3>
            <p className="mb-4">
              Contenido del popup que se muestra al hacer clic en la card.
            </p>
          </>
        )}
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
