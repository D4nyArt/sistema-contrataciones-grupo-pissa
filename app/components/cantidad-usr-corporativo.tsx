/**
 * cantidad-usr-corporativo.tsx
 *
 * Proporciona un componente para mostrar el conteo total de usuarios corporativos en el sistema.
 *
 * Este módulo consulta la base de datos de usuarios, filtra por rol "enCorporativo" y
 * muestra el número total en un formato visual destacado. Se utiliza principalmente
 * en dashboards y métricas del sistema para proporcionar información estadística
 * en tiempo real sobre la cantidad de usuarios asignados a contratos corporativos.
 */

import { ref, get } from "firebase/database";
import { database } from "../../firebaseConfig";

/**
 * Renderiza el conteo total de usuarios corporativos registrados en el sistema.
 *
 * Este componente asíncrono consulta la base de datos de usuarios, itera sobre
 * todos los registros para identificar aquellos con rol "enCorporativo" y presenta
 * el conteo total en un formato visual destacado. La consulta se realiza en
 * tiempo de renderizado del servidor para obtener datos actualizados.
 *
 * @returns Una promesa que resuelve al elemento JSX que muestra el conteo de usuarios corporativos.
 *
 * @example
 * ```tsx
 * // Uso en un dashboard de métricas
 * <CantCorporativo />
 *
 * // En una tarjeta de estadísticas corporativas
 * <div className="corporate-stats-card">
 *   <h3>Usuarios Corporativos</h3>
 *   <CantCorporativo />
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
export default async function CantCorporativo() {
  /** Obtiene todos los usuarios desde la base de datos. */
  const snapshot = await get(ref(database, "usuarios"));

  /** Contador inicializado para llevar el total de usuarios corporativos. */
  let usersInCorporate = 0;

  if (snapshot.exists()) {
    /** Datos de todos los usuarios obtenidos de la base de datos. */
    const usuarios = snapshot.val();

    // Itera sobre todos los usuarios para contar los que están en corporativo
    for (const key in usuarios) {
      if (usuarios[key].rol === "enCorporativo") {
        usersInCorporate++;
      }
    }
  }

  return (
    <div className="flex flex-col">
      <span className="text-xl text-gray-700">
        <strong className="text-3xl text-[#212529]">{usersInCorporate}</strong>
      </span>
    </div>
  );
}
