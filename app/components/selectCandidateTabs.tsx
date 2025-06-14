/**
 * selectCandidateTabs.tsx
 *
 * Proporciona un sistema de navegación por pestañas para la visualización de datos de candidatos.
 *
 * Este componente implementa una interfaz tabular que permite alternar entre la vista de
 * expediente y contratos de un candidato específico. Integra con la URL para mantener
 * el estado de la pestaña activa entre navegaciones y proporciona transiciones visuales
 * suaves. Cada pestaña carga componentes especializados para mostrar información
 * detallada del expediente o historial de contratos del candidato.
 */

"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

import CandidateContractsPage from "@/app/components/candidateContractsPage";
import ExpedienteCandidato from "@/app/components/expedienteCandidato";

/**
 * Renderiza un sistema de pestañas para navegación entre expediente y contratos de candidato.
 *
 * Este componente proporciona una interfaz de navegación tabular que permite al usuario
 * alternar entre dos vistas principales de información del candidato: expediente completo
 * y historial de contratos. Sincroniza automáticamente con parámetros de URL para mantener
 * el estado de la pestaña activa, permitiendo navegación directa y compartir enlaces
 * específicos. Incluye efectos visuales de transición y carga condicional de componentes
 * según la pestaña seleccionada para optimizar el rendimiento.
 *
 * @param props - Las propiedades del componente.
 * @param props.userID - El ID único del candidato cuyos datos se van a visualizar.
 * @returns El elemento JSX que renderiza las pestañas y el contenido correspondiente.
 *
 * @example
 * ```tsx
 * // Uso en página de perfil de candidato
 * <div className="candidate-profile">
 *   <CandidateHeader />
 *   <SelectCandidateTab userID={candidateId} />
 * </div>
 *
 * // Con navegación directa a pestaña específica
 * // URL: /candidate/123?tab=contratos
 * <SelectCandidateTab userID="123" />
 *
 * // En dashboard de RH para revisión de candidatos
 * <div className="candidate-review">
 *   <h1>Revisión de Candidato</h1>
 *   <SelectCandidateTab userID={selectedCandidate.id} />
 * </div>
 * ```
 *
 * @see {@link CandidateContractsPage} - Componente que muestra el historial de contratos
 * @see {@link ExpedienteCandidato} - Componente que muestra el expediente completo
 */
export default function SelectCandidateTab({ userID }: { userID: string }) {
  /** Hook de Next.js para navegación programática. */
  const router = useRouter();

  /** Hook de Next.js para acceder a parámetros de consulta de la URL. */
  const searchParams = useSearchParams();

  /** Parámetro de pestaña extraído de la URL. */
  const tabParam = searchParams.get("tab");

  /** Estado que controla qué pestaña está actualmente activa. */
  const [active, setActive] = useState<"expediente" | "contratos">(
    "expediente"
  );

  useEffect(() => {
    /**
     * Sincroniza el estado de la pestaña activa con los parámetros de URL.
     *
     * Este efecto se ejecuta cuando cambian los parámetros de URL para
     * mantener la consistencia entre la URL y el estado local del componente.
     * Permite navegación directa a pestañas específicas y persistencia del
     * estado al recargar la página.
     */
    if (tabParam === "contratos" || tabParam === "expediente") {
      setActive(tabParam);
    }
  }, [tabParam]);

  /**
   * Maneja el cambio de pestaña y actualiza la URL correspondiente.
   *
   * Esta función actualiza tanto el estado local como los parámetros de URL
   * cuando el usuario selecciona una pestaña diferente. Permite que el estado
   * de la pestaña persista en el historial del navegador y se pueda compartir
   * mediante enlaces directos.
   *
   * @param tab - La pestaña a activar ("expediente" o "contratos").
   */
  const handleTabChange = (tab: "expediente" | "contratos") => {
    router.push(`?tab=${tab}`);
    setActive(tab);
  };

  return (
    <div className="space-x-6 items-center">
      {/* Barra de navegación de pestañas */}
      <div className="border-b space-x-6 mb-6 border-gray-300 w-full">
        <button
          onClick={() => handleTabChange("expediente")}
          className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
            active === "expediente"
              ? "border-[#2d4583] text-[#2d4583]"
              : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
          }`}
        >
          Expediente
        </button>

        <button
          onClick={() => handleTabChange("contratos")}
          className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
            active === "contratos"
              ? "border-[#2d4583] text-[#2d4583]"
              : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
          }`}
        >
          Contratos
        </button>
      </div>

      {/* Renderizado condicional del contenido según la pestaña activa */}
      {active === "contratos" && <CandidateContractsPage uid={userID} />}
      {active === "expediente" && <ExpedienteCandidato userId={userID} />}
    </div>
  );
}
