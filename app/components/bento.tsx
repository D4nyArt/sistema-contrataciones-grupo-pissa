/**
 * bento.tsx
 *
 * Proporciona un layout de dashboard tipo Bento con métricas y estadísticas del sistema.
 *
 * Este componente renderiza una grilla de tarjetas estadísticas que muestran información
 * clave del sistema como cantidad de empleados, candidatos, proyectos y corporativos.
 * Utiliza un diseño responsivo tipo Bento que se adapta a diferentes tamaños de pantalla.
 */

import { UserPlus, Users, Building, FolderOpenDot } from "lucide-react";
import CountUsers from "./countusers";
import CantCandidatos from "./cantidad-candidatos";
import CantProyectos from "./cantidad-usr-proyectos";
import CantCorporativo from "./cantidad-usr-corporativo";
import RevisandoList from "./candidatoSeguidos";
import PasswordRequest from "./passwordRequest";

/**
 * Renderiza un dashboard con layout tipo Bento mostrando estadísticas del sistema.
 *
 * Este componente organiza las métricas principales del sistema en un diseño de grilla
 * responsivo. Incluye tarjetas para empleados, candidatos, proyectos y corporativos,
 * cada una con iconos distintivos y contadores en tiempo real. También incluye una
 * sección expandida para mostrar candidatos en proceso de revisión.
 *
 * @returns El elemento JSX que renderiza el dashboard Bento completo.
 *
 * @example
 * ```tsx
 * // Renderizar el dashboard en la página principal
 * <Bento />
 * ```
 *
 * @see {@link CountUsers} - Componente que cuenta y muestra el total de empleados
 * @see {@link CantCandidatos} - Componente que cuenta y muestra el total de candidatos
 * @see {@link CantProyectos} - Componente que cuenta usuarios en proyectos
 * @see {@link CantCorporativo} - Componente que cuenta usuarios corporativos
 * @see {@link RevisandoList} - Componente que muestra candidatos en proceso de revisión
 */
export default function Bento() {
  return (
    <div className="md:grid md:grid-cols-4 md:grid-rows-5 gap-4 w-full h-full flex flex-col">
      {/* Tarjeta de Empleados */}
      <div className="bg-white rounded-xl p-6 shadow-md flex flex-row justify-center items-center gap-8">
        <div className="bg-[#f4a261] rounded-full p-4 text-white transition-transform transform hover:scale-110">
          <Users />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[#495057]">Total de empleados</h2>
          <CountUsers />
        </div>
      </div>

      {/* Tarjeta de Candidatos */}
      <div className="bg-white rounded-xl p-6 shadow-md flex flex-row justify-center items-center gap-8">
        <div className="bg-[#42b883] rounded-full p-4 text-white transition-transform transform hover:scale-110">
          <UserPlus />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[#495057]">Total de candidatos</h2>
          <CantCandidatos />
        </div>
      </div>

      {/* Tarjeta de Proyectos */}
      <div className="bg-white rounded-xl p-6 shadow-md flex flex-row justify-center items-center gap-8">
        <div className="bg-[#d55672] rounded-full p-4 text-white transition-transform transform hover:scale-110">
          <FolderOpenDot />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[#495057]">Total en proyecto</h2>
          <CantProyectos />
        </div>
      </div>

      {/* Tarjeta de Corporativo */}
      <div className="bg-white rounded-xl p-6 shadow-md flex flex-row justify-center items-center gap-8 col-start-4 row-start-1">
        <div className="bg-[#aec5eb] rounded-full p-4 text-white transition-transform transform hover:scale-110">
          <Building />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[#495057]">Total en corporativo</h2>
          <CantCorporativo />
        </div>
      </div>

      {/* Sección expandida para lista de candidatos en revisión */}
      <div className="bg-white rounded-xl p-6 shadow-md col-span-3 row-span-4 col-start-1 row-start-2">
        <RevisandoList />
      </div>

      {/* Sección para lista de solicitudes de recuperación de contraseña */}
      <div className="bg-gray-300 rounded-xl row-span-4 col-start-4 row-start-2">
        <PasswordRequest />
      </div>
    </div>
  );
}
