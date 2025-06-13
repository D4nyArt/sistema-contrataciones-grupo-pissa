/**
 * menuUsuarios.tsx
 *
 * Proporciona controles de navegación y filtrado para listas de usuarios.
 *
 * Este componente renderiza una barra de herramientas completa con funcionalidades
 * de búsqueda en tiempo real, ordenamiento por múltiples criterios y alternancia
 * entre modos de visualización (grid y tabla). Integra parámetros de URL para
 * mantener el estado de visualización entre navegaciones y proporciona una
 * experiencia de usuario optimizada para la gestión de listados de usuarios.
 */

"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Define las propiedades del componente UserMenu.
 */
interface UserMenuProps {
  /** El término de búsqueda actual. */
  searchTerm: string;

  /** La opción de ordenamiento seleccionada. */
  sortOption: string;

  /** El modo de visualización activo ("grid" o "tabla"). */
  activo: "grid" | "tabla";

  /** Función para actualizar el término de búsqueda. */
  setSearchTerm: (term: string) => void;

  /** Función para cambiar la opción de ordenamiento. */
  setSortOption: (option: string) => void;

  /** Función para cambiar el modo de visualización. */
  setActivo: (mode: "grid" | "tabla") => void;
}

/**
 * Renderiza una barra de herramientas completa para gestión de listas de usuarios.
 *
 * Este componente proporciona controles esenciales para mejorar la experiencia
 * de navegación en listados de usuarios. Incluye un campo de búsqueda en tiempo
 * real, selector de ordenamiento con múltiples opciones (nombre/apellido A-Z/Z-A)
 * y botones para alternar entre vista de grid y tabla. Integra con la URL para
 * persistir el modo de visualización y mantener el estado entre navegaciones.
 *
 * @param props - Las propiedades del componente.
 * @param props.searchTerm - El término de búsqueda actual.
 * @param props.sortOption - La opción de ordenamiento seleccionada.
 * @param props.activo - El modo de visualización activo.
 * @param props.setSearchTerm - Función para actualizar el término de búsqueda.
 * @param props.setSortOption - Función para cambiar la opción de ordenamiento.
 * @param props.setActivo - Función para cambiar el modo de visualización.
 * @returns El elemento JSX que renderiza la barra de herramientas de usuario.
 *
 * @example
 * ```tsx
 * // Uso en componente de lista de usuarios
 * <UserMenu
 *   searchTerm={searchTerm}
 *   sortOption={sortOption}
 *   activo={viewMode}
 *   setSearchTerm={setSearchTerm}
 *   setSortOption={setSortOption}
 *   setActivo={setViewMode}
 * />
 *
 * // Con estado del componente padre
 * const [searchTerm, setSearchTerm] = useState("");
 * const [sortOption, setSortOption] = useState("");
 * const [activo, setActivo] = useState<"grid" | "tabla">("grid");
 *
 * <UserMenu
 *   searchTerm={searchTerm}
 *   sortOption={sortOption}
 *   activo={activo}
 *   setSearchTerm={setSearchTerm}
 *   setSortOption={setSortOption}
 *   setActivo={setActivo}
 * />
 * ```
 */
export default function UserMenu({
  searchTerm,
  sortOption,
  activo,
  setSearchTerm,
  setSortOption,
  setActivo,
}: UserMenuProps) {
  /** Hook de Next.js para navegación programática. */
  const router = useRouter();

  /** Hook de Next.js para acceder a parámetros de consulta de la URL. */
  const searchParams = useSearchParams();

  /** Parámetro de vista extraído de la URL. */
  const viewParam = searchParams.get("view");

  useEffect(() => {
    /**
     * Sincroniza el modo de visualización con los parámetros de URL.
     *
     * Este efecto se ejecuta cuando cambian los parámetros de URL para
     * mantener la consistencia entre la URL y el estado local del componente.
     * Permite que los usuarios compartan enlaces con el modo de vista específico.
     */
    if (viewParam === "tabla" || viewParam === "grid") {
      setActivo(viewParam);
    }
  }, [viewParam, setActivo]);

  /**
   * Maneja el cambio de modo de visualización y actualiza la URL.
   *
   * Esta función actualiza tanto el estado local como los parámetros de URL
   * para mantener la sincronización entre la interfaz y la navegación.
   * Permite que el estado de visualización persista al recargar la página
   * o al compartir enlaces.
   *
   * @param view - El nuevo modo de visualización a activar.
   */
  const handleViewChange = (view: "grid" | "tabla") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    router.push(`?${params.toString()}`);
    setActivo(view);
  };

  return (
    <div className="mb-4 flex gap-6 text-black animate-fade-in-up">
      {/* Campo de búsqueda en tiempo real */}
      <input
        type="text"
        placeholder="Buscar"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="p-2 border border-gray-400 rounded-lg w-full bg-white appearance-none outline-amber-700"
      />

      {/* Selector de opciones de ordenamiento */}
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        className="cursor-pointer border p-1 pl-4 rounded-lg bg-[#2d4583] text-white hover:bg-[#08b177]"
      >
        <option value="">Ordenar por</option>
        <option value="nombreAZ">Nombre A → Z</option>
        <option value="nombreZA">Nombre Z → A</option>
        <option value="apellidoAZ">Apellido A → Z</option>
        <option value="apellidoZA">Apellido Z → A</option>
      </select>

      {/* Botones de alternancia de vista (ocultos en móvil) */}
      <div className="md:flex shadow-md bg-white rounded-l-lg rounded-r-lg hidden text-[#495057]">
        <button
          onClick={() => handleViewChange("grid")}
          className={`cursor-pointer rounded-lg p-1 pl-2 pr-2 transition-colors border ${
            activo === "grid"
              ? "border-[#2d4583] text-[#2d4583]"
              : "border-transparent hover:text-[#08b177]"
          }`}
        >
          <LayoutGrid />
        </button>
        <button
          onClick={() => handleViewChange("tabla")}
          className={`cursor-pointer rounded-lg p-1 pl-2 pr-2 transition-colors border ${
            activo === "tabla"
              ? "border-[#2d4583] text-[#2d4583]"
              : "border-transparent hover:text-[#08b177]"
          }`}
        >
          <Table2 />
        </button>
      </div>
    </div>
  );
}
