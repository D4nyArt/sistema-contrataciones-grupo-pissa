/**
 * botonRegresar.tsx
 *
 * Proporciona un botón de navegación inteligente para regresar a la página anterior.
 *
 * Este componente implementa lógica de navegación que puede regresar a una URL específica
 * proporcionada como parámetro de consulta, o utilizar la funcionalidad nativa del navegador
 * para retroceder en el historial. Incluye un icono de flecha y texto descriptivo.
 */

"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Renderiza un botón que permite regresar a la página anterior de manera inteligente.
 *
 * Este componente verifica si existe un parámetro de consulta "from" en la URL actual.
 * Si existe, navega directamente a esa ruta específica. Si no existe, utiliza la
 * funcionalidad nativa del navegador para retroceder una página en el historial.
 * Incluye un icono de flecha izquierda para indicar visualmente la acción de retroceso.
 *
 * @returns El elemento JSX que renderiza el botón de regresar.
 *
 * @example
 * ```tsx
 * // Uso básico - regresará usando router.back()
 * <BotonRegresar />
 *
 * // Con parámetro "from" en la URL - regresará a esa ruta específica
 * // URL: /current-page?from=/dashboard
 * <BotonRegresar /> // Navegará a /dashboard
 *
 * // En una página de detalle con origen conocido
 * // URL: /user/123?from=/users-list
 * <BotonRegresar /> // Navegará de vuelta a /users-list
 * ```
 */
export default function BotonRegresar() {
  /** Hook del router de Next.js para navegación programática. */
  const router = useRouter();

  /** Hook para acceder a los parámetros de consulta de la URL actual. */
  const searchParams = useSearchParams();

  /** Extrae el parámetro "from" que indica la URL de origen. */
  const from = searchParams.get("from");

  /**
   * Maneja la lógica de navegación hacia atrás.
   *
   * Si existe un parámetro "from", navega a esa ruta específica.
   * De lo contrario, utiliza la funcionalidad nativa del navegador
   * para retroceder una página en el historial.
   */
  const handleRegresar = () => {
    if (from) {
      router.push(from);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleRegresar}
      className="items-center flex group cursor-pointer"
    >
      <ChevronLeft />
      <span className="pl-2">Regresar</span>
    </button>
  );
}
