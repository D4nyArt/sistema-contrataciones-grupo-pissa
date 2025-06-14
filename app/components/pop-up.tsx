/**
 * pop-up.tsx
 *
 * Proporciona un componente de ventana modal emergente reutilizable para la aplicación.
 *
 * Este componente renderiza una ventana modal con overlay que puede contener cualquier
 * contenido personalizado. Incluye funcionalidad de cierre mediante click en el overlay
 * o botón específico, prevención de cierre accidental mediante propagación de eventos
 * y estilos responsivos para una experiencia de usuario consistente en todos los
 * dispositivos y contextos de uso.
 */

"use client";
import React from "react";

/**
 * Define las propiedades del componente PopUp.
 */
interface PopUpProps {
  /** Controla la visibilidad del modal (true para mostrar, false para ocultar). */
  show: boolean;

  /** Función callback opcional que se ejecuta al cerrar el modal. */
  onClose?: () => void;

  /** El contenido JSX que se renderizará dentro del modal. */
  children: React.ReactNode;
}

/**
 * Renderiza una ventana modal emergente con overlay y contenido personalizable.
 *
 * Este componente proporciona una interfaz modal estándar con overlay semitransparente
 * que permite mostrar contenido personalizado en una ventana emergente. Incluye
 * funcionalidad de cierre mediante click en el overlay o botón dedicado, prevención
 * de cierre accidental usando propagación de eventos y diseño responsivo que se
 * adapta a diferentes tamaños de pantalla manteniendo la usabilidad y accesibilidad.
 *
 * @param props - Las propiedades del componente.
 * @param props.show - Controla si el modal debe mostrarse o permanecer oculto.
 * @param props.onClose - Función opcional ejecutada al cerrar el modal.
 * @param props.children - El contenido JSX a renderizar dentro del modal.
 * @returns El elemento JSX que renderiza el modal, o null si show es false.
 *
 * @example
 * ```tsx
 * // Uso básico con estado de control
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <PopUp show={isOpen} onClose={() => setIsOpen(false)}>
 *   <h2 className="font-bold">Confirmar Acción</h2>
 *   <p>¿Está seguro de que desea continuar?</p>
 *   <button onClick={handleConfirm}>Confirmar</button>
 * </PopUp>
 *
 * // Modal de confirmación de eliminación
 * <PopUp show={showDeleteModal} onClose={closeDeleteModal}>
 *   <h2 className="font-bold text-red-600">Eliminar Usuario</h2>
 *   <p>Esta acción no se puede deshacer.</p>
 *   <div className="flex gap-2 mt-4">
 *     <button onClick={handleDelete} className="bg-red-500 text-white">
 *       Eliminar
 *     </button>
 *     <button onClick={closeDeleteModal} className="bg-gray-300">
 *       Cancelar
 *     </button>
 *   </div>
 * </PopUp>
 *
 * // Modal informativo simple
 * <PopUp show={showInfo} onClose={() => setShowInfo(false)}>
 *   <div className="text-center">
 *     <h3 className="font-semibold">Operación Exitosa</h3>
 *     <p>Los cambios se guardaron correctamente.</p>
 *   </div>
 * </PopUp>
 * ```
 */
export default function PopUp({ show, onClose, children }: PopUpProps) {
  // Retorna null si el modal no debe mostrarse
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 shadow-lg max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        {onClose && (
          <button
            className="mt-4 px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 cursor-pointer"
            onClick={onClose}
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
