/**
 * tablaSeguidosSkeleton.tsx
 *
 * Proporciona un componente de esqueleto animado para el estado de carga de la tabla de candidatos seguidos.
 *
 * Este componente renderiza un placeholder visual que simula la estructura exacta de la tabla
 * de candidatos bajo seguimiento mientras se cargan los datos desde el servidor. Incluye
 * elementos placeholder para el título, encabezados de columna y múltiples filas de datos,
 * todos con animación de pulso para indicar actividad de carga y mantener la estructura
 * visual durante la transición de datos.
 */

export default function SeguidosSkeleton() {
  return (
    <div className="w-full h-full animate-pulse">
      <div className="w-60 h-8 bg-gray-200 rounded"></div>
      <table className="table-auto w-full border-separate border-spacing-y-2 animate-pulse">
        <thead>
          <tr>
            <th className="flex px-4 py-4 items-start text-[#495057] font-normal text-sm">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </th>
            <th className="fkexpx-4 py-4 items-start text-[#495057] font-normal text-sm">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </th>
            <th className="px-4 py-4 items-start text-[#495057] font-normal text-sm">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </th>
            <th className="px-4 py-4 items-start text-[#495057] font-normal text-sm">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
          </tr>
          <tr>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
          </tr>
          <tr>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
          </tr>
          <tr>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
          </tr>
          <tr>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
            <td className="px-4 py-4 border-b border-gray-300">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
