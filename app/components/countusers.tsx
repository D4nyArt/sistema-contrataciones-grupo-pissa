/**
 * countusers.tsx
 *
 * Proporciona un componente para mostrar el conteo total de empleados en el sistema.
 *
 * Este módulo consulta la base de datos de usuarios, filtra por roles de empleados
 * (rh, enCorporativo, enProyecto) y muestra el número total en un formato visual
 * destacado. Se utiliza principalmente en dashboards y métricas del sistema para
 * proporcionar información estadística en tiempo real sobre la cantidad total de empleados.
 */

import { ref, get } from "firebase/database";
import { database } from "../../firebaseConfig";

/**
 * Renderiza el conteo total de empleados registrados en el sistema.
 *
 * Este componente asíncrono consulta la base de datos de usuarios, itera sobre
 * todos los registros para identificar aquellos con roles de empleado (rh,
 * enCorporativo, enProyecto) y presenta el conteo total en un formato visual
 * destacado. La consulta se realiza en tiempo de renderizado del servidor para
 * obtener datos actualizados.
 *
 * @returns Una promesa que resuelve al elemento JSX que muestra el conteo de empleados.
 *
 * @example
 * ```tsx
 * // Uso en un dashboard de métricas
 * <CountUsers />
 *
 * // En una tarjeta de estadísticas de empleados
 * <div className="employee-stats-card">
 *   <h3>Total Empleados</h3>
 *   <CountUsers />
 * </div>
 *
 * // En un resumen de distribución organizacional
 * <div className="org-distribution">
 *   <CountUsers /> empleados activos
 *   <CantCandidatos /> candidatos en proceso
 * </div>
 * ```
 */
export default async function CountUsers() {
  /** Obtiene todos los usuarios desde la base de datos. */
  const snapshot = await get(ref(database, "usuarios"));

  /** Contador inicializado para llevar el total de empleados. */
  let totalUsers = 0;

  if (snapshot.exists()) {
    /** Datos de todos los usuarios obtenidos de la base de datos. */
    const usuarios = snapshot.val();

    // Itera sobre todos los usuarios para contar los empleados
    for (const key in usuarios) {
      if (
        usuarios[key].rol === "rh" ||
        usuarios[key].rol === "enCorporativo" ||
        usuarios[key].rol === "enProyecto"
      ) {
        totalUsers++;
      }
    }
  }

  return (
    <div className="flex flex-col">
      <span className="text-xl text-gray-700">
        <strong className="text-5xl md:text-3xl md:text-[#212529] text-white">{totalUsers}</strong>
      </span>
    </div>
  );
}
