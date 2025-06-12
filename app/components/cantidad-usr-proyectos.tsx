/**
 * cantidad-usr-proyectos.tsx
 *
 * Proporciona un componente para mostrar el conteo total de usuarios en proyectos en el sistema.
 *
 * Este módulo consulta la base de datos de usuarios, filtra por rol "enProyecto" y
 * muestra el número total en un formato visual destacado. Se utiliza principalmente
 * en dashboards y métricas del sistema para proporcionar información estadística
 * en tiempo real sobre la cantidad de usuarios asignados a contratos de proyectos.
 */

import { ref, get } from "firebase/database";
import { database } from "../../firebaseConfig";

/**
 * Renderiza el conteo total de usuarios en proyectos registrados en el sistema.
 *
 * Este componente asíncrono consulta la base de datos de usuarios, itera sobre
 * todos los registros para identificar aquellos con rol "enProyecto" y presenta
 * el conteo total en un formato visual destacado. La consulta se realiza en
 * tiempo de renderizado del servidor para obtener datos actualizados.
 *
 * @returns Una promesa que resuelve al elemento JSX que muestra el conteo de usuarios en proyectos.
 *
 * @example
 * ```tsx
 * // Uso en un dashboard de métricas
 * <CantProyectos />
 *
 * // En una tarjeta de estadísticas de proyectos
 * <div className="project-stats-card">
 *   <h3>Usuarios en Proyectos</h3>
 *   <CantProyectos />
 * </div>
 *
 * // En un resumen de distribución de roles
 * <div className="role-distribution">
 *   <CantCandidatos /> candidatos
 *   <CantCorporativo /> en corporativo
 *   <CantProyectos /> en proyectos
 * </div>
 * ```
 */
export default async function CantProyectos() {
  /** Obtiene todos los usuarios desde la base de datos. */
  const snapshot = await get(ref(database, "usuarios"));

  /** Contador inicializado para llevar el total de usuarios en proyectos. */
  let usersInProyect = 0;

  if (snapshot.exists()) {
    /** Datos de todos los usuarios obtenidos de la base de datos. */
    const usuarios = snapshot.val();

    // Itera sobre todos los usuarios para contar los que están en proyectos
    for (const key in usuarios) {
      if (usuarios[key].rol === "enProyecto") {
        usersInProyect++;
      }
    }
  }

  return (
    <div className="flex flex-col">
      <span className="text-xl text-gray-700">
        <strong className="text-3xl text-[#212529]">{usersInProyect}</strong>
      </span>
    </div>
  );
}
