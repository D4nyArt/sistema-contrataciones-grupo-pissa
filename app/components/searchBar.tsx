/**
 * searchBar.tsx
 *
 * Proporciona un componente de barra de búsqueda reutilizable para filtrado en tiempo real.
 *
 * Este componente renderiza un campo de entrada de texto especializado para funcionalidad
 * de búsqueda con estilos consistentes y comportamiento controlado. Diseñado para ser
 * integrado en listas, tablas y cualquier interfaz que requiera capacidades de filtrado
 * inmediato, manteniendo una experiencia de usuario uniforme en toda la aplicación.
 */

"use client";

/**
 * Renderiza una barra de búsqueda controlada con estilos consistentes del sistema.
 *
 * Este componente proporciona un campo de entrada optimizado para búsquedas en tiempo real
 * con estilos predefinidos que mantienen la consistencia visual de la aplicación. Utiliza
 * un patrón controlado donde el componente padre maneja el estado de búsqueda, permitiendo
 * integración flexible en diferentes contextos como listas de usuarios, tablas de datos
 * o cualquier interfaz que requiera funcionalidad de filtrado inmediato.
 *
 * @param props - Las propiedades del componente.
 * @param props.searchTerm - El valor actual del término de búsqueda.
 * @param props.setSearchTerm - Función para actualizar el término de búsqueda.
 * @returns El elemento JSX que renderiza la barra de búsqueda.
 *
 * @example
 * ```tsx
 * // Uso en lista de usuarios
 * const [searchTerm, setSearchTerm] = useState("");
 *
 * <div className="user-list">
 *   <SearchBar
 *     searchTerm={searchTerm}
 *     setSearchTerm={setSearchTerm}
 *   />
 *   <UsersList filteredBy={searchTerm} />
 * </div>
 *
 * // En tabla de datos
 * <div className="data-table">
 *   <SearchBar
 *     searchTerm={query}
 *     setSearchTerm={setQuery}
 *   />
 *   <DataTable searchQuery={query} />
 * </div>
 *
 * // Con filtrado personalizado
 * const filteredItems = items.filter(item =>
 *   item.name.toLowerCase().includes(searchTerm.toLowerCase())
 * );
 *
 * <SearchBar
 *   searchTerm={searchTerm}
 *   setSearchTerm={setSearchTerm}
 * />
 * ```
 *
 * @see {@link useState} - Hook de React para manejar el estado de búsqueda
 * @see {@link String.prototype.toLowerCase} - Método para búsquedas insensibles a mayúsculas
 */
interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export default function SearchBar({
  searchTerm,
  setSearchTerm,
}: SearchBarProps) {
  return (
    <input
      type="text"
      placeholder="Buscar"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="p-2 border border-gray-400 rounded-lg w-full bg-white appearance-none outline-amber-700"
    />
  );
}
