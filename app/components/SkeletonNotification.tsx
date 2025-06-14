/**
 * SkeletonNotification.tsx
 *
 * Proporciona un componente de esqueleto animado para el estado de carga de notificaciones.
 *
 * Este componente renderiza un placeholder visual que simula la estructura de una
 * notificación mientras se cargan los datos reales desde el servidor. Utiliza
 * animaciones de pulso suaves para indicar actividad de carga y mantiene las
 * proporciones y layout exactos de las notificaciones reales para una transición
 * visual fluida cuando se completa la carga de datos.
 */

export default function SkeletonNotification() {
  return (
    <div className="flex items-center space-x-4 px-4 py-2 animate-pulse border-b border-gray-200">
      <div className="rounded-full bg-gray-300 h-6 w-6" />
      <div className="rounded bg-gray-300 h-6 w-6" />
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div>
    </div>
  );
}
