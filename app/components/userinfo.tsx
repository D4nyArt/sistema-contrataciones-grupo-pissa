/**
 * userinfo.tsx
 *
 * Proporciona una interfaz completa de visualización de información de usuario con sistema de pestañas.
 *
 * Este componente maneja la presentación integral de datos de usuario mediante un sistema
 * de navegación por pestañas que se adapta dinámicamente según el rol del usuario. Para
 * personal de RH, limita la vista solo a información básica, mientras que para candidatos
 * y otros roles proporciona acceso completo a expediente, contratos e historial. Incluye
 * sincronización con parámetros de URL para navegación directa y persistencia de estado
 * entre sesiones.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../../firebaseConfig";
import { getDatabase, ref, get } from "firebase/database";

import ListInformation from "@/app/components/usuario-phone";
import Usuarios from "@/app/components/usuario";
import ExpedienteRH from "@/app/components/expedienteRH";
import ContractsPage from "@/app/components/contractsPage";
import InfoPerfil from "./informacionPerfil";
import History from "./history/history";

/** Define los tipos de pestañas disponibles en la interfaz de usuario. */
type Tab = "información" | "expediente" | "contratos" | "histórico";

/**
 * Renderiza una interfaz completa de información de usuario con navegación por pestañas.
 *
 * Este componente proporciona una vista integral de los datos del usuario a través de
 * un sistema de pestañas que se adapta dinámicamente según el rol del usuario autenticado.
 * Para personal de RH, restringe el acceso únicamente a la pestaña de información básica,
 * mientras que para candidatos y otros roles permite navegación completa entre información,
 * expediente, contratos e historial. Incluye detección automática de rol desde Firebase,
 * sincronización bidireccional con parámetros de URL para navegación directa, y renderizado
 * responsivo que se adapta entre versiones de escritorio y móvil.
 *
 * @param props - Las propiedades del componente.
 * @param props.id - El ID único del usuario cuyos datos se van a visualizar.
 * @returns El elemento JSX que renderiza la interfaz completa de información de usuario.
 *
 * @example
 * ```tsx
 * // Uso en página de perfil de usuario
 * <div className="user-profile-page">
 *   <UserInfo id="user123" />
 * </div>
 *
 * // Con navegación directa a pestaña específica
 * // URL: /usuario/456?tab=expediente
 * <UserInfo id="456" />
 *
 * // En dashboard de RH para revisión de candidatos
 * <div className="candidate-review">
 *   <h1>Perfil de Candidato</h1>
 *   <UserInfo id={selectedCandidateId} />
 * </div>
 *
 * // El componente automáticamente:
 * // 1. Detecta el rol del usuario desde Firebase
 * // 2. Adapta las pestañas disponibles según el rol
 * // 3. Sincroniza con parámetros de URL
 * // 4. Renderiza el contenido apropiado para cada pestaña
 * ```
 *
 * @see {@link ListInformation} - Componente de información de usuario para móvil
 * @see {@link Usuarios} - Componente de información de usuario para escritorio
 * @see {@link ExpedienteRH} - Componente de expediente visto por RH
 * @see {@link ContractsPage} - Componente de visualización de contratos
 * @see {@link InfoPerfil} - Componente de información básica del perfil
 * @see {@link History} - Componente de historial del usuario
 */
export default function UserInfo({ id }: { id: string }) {
  /** Hook de Next.js para navegación programática. */
  const router = useRouter();

  /** Hook de Next.js para acceder a parámetros de consulta de la URL. */
  const searchParams = useSearchParams();

  /** Parámetro de pestaña extraído de la URL. */
  const tabParam = searchParams.get("tab") as Tab | null;

  /** Estado que almacena el rol del usuario obtenido desde Firebase. */
  const [role, setRole] = useState<string | null>(null);

  /** Estado que controla qué pestaña está actualmente activa. */
  const [active, setActive] = useState<Tab>("información");

  useEffect(() => {
    /**
     * Obtiene el rol del usuario desde Firebase Realtime Database.
     *
     * Esta función consulta el rol del usuario específico desde Firebase
     * para determinar qué pestañas y funcionalidades estarán disponibles
     * en la interfaz. El rol determina las restricciones de acceso.
     */
    async function fetchRole() {
      try {
        const db = getDatabase();
        const snap = await get(ref(db, `usuarios/${id}/rol`));
        setRole(snap.exists() ? snap.val() : null);
      } catch {
        setRole(null);
      }
    }
    fetchRole();
  }, [id]);

  useEffect(() => {
    /**
     * Sincroniza el estado de la pestaña activa con los parámetros de URL y rol.
     *
     * Este efecto maneja la lógica de navegación entre pestañas:
     * - Para usuarios de RH: fuerza la pestaña "información" y actualiza la URL
     * - Para otros roles: sincroniza con el parámetro de URL si es válido
     * - Mantiene consistencia entre el estado local y la navegación del navegador
     */
    if (role === "rh") {
      setActive("información");
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "información");
      router.replace(`?${params.toString()}`);
    } else if (
      tabParam === "información" ||
      tabParam === "expediente" ||
      tabParam === "contratos" ||
      tabParam === "histórico"
    ) {
      setActive(tabParam);
    }
  }, [role, tabParam, router, searchParams]);

  /**
   * Maneja el cambio de pestaña y actualiza la URL correspondiente.
   *
   * Esta función gestiona la navegación entre pestañas con validaciones de rol:
   * - Previene navegación no autorizada para usuarios de RH
   * - Actualiza los parámetros de URL para mantener estado navegable
   * - Sincroniza el estado local con la navegación del navegador
   *
   * @param tab - La nueva pestaña a activar.
   */
  const handleTabChange = (tab: Tab) => {
    if (role === "rh" && tab !== "información") return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
    setActive(tab);
  };

  if (role === null) return <div>Cargando perfil…</div>;

  return (
    <div>
      {/* Componente de información para escritorio */}
      <div className="hidden md:block">
        <Usuarios />
      </div>

      {/* Componente de información para móvil */}
      <div className="block md:hidden">
        <ListInformation />
      </div>

      {/* Sistema de navegación por pestañas */}
      <div className="space-x-6 border-b border-gray-300 mb-6">
        <button
          onClick={() => handleTabChange("información")}
          className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
            active === "información"
              ? "border-[#2d4583] text-[#2d4583]"
              : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
          }`}
        >
          Información
        </button>

        {/* Pestañas adicionales solo disponibles para roles no-RH */}
        {role !== "rh" && (
          <>
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
            <button
              onClick={() => handleTabChange("histórico")}
              className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
                active === "histórico"
                  ? "border-[#2d4583] text-[#2d4583]"
                  : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
              }`}
            >
              Histórico
            </button>
          </>
        )}
      </div>

      {/* Renderizado condicional del contenido según la pestaña activa y el rol */}
      <div>
        {active === "información" && <InfoPerfil />}
        {active === "expediente" && role !== "rh" && (
          <ExpedienteRH userId={id} />
        )}
        {active === "contratos" && role !== "rh" && <ContractsPage uid={id} />}
        {active === "histórico" && role !== "rh" && <History />}
      </div>
    </div>
  );
}
