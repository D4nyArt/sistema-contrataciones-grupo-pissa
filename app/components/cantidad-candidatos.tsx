/**
 * cantidad-candidatos.tsx
 *
 * Proporciona un componente para mostrar el conteo total de candidatos en el sistema.
 *
 * Este módulo consulta la base de datos de usuarios, filtra por rol "candidato" y
 * muestra el número total en un formato visual destacado. Se utiliza principalmente
 * en dashboards y métricas del sistema para proporcionar información estadística
 * en tiempo real sobre la cantidad de candidatos registrados.
 */

import { ref, get } from "firebase/database";
import { database } from "../../firebaseConfig";

/**
 * Renderiza el conteo total de candidatos registrados en el sistema.
 *
 * Este componente asíncrono consulta la base de datos de usuarios, itera sobre
 * todos los registros para identificar aquellos con rol "candidato" y presenta
 * el conteo total en un formato visual destacado. La consulta se realiza en
 * tiempo de renderizado del servidor para obtener datos actualizados.
 *
 * @returns Una promesa que resuelve al elemento JSX que muestra el conteo de candidatos.
 *
 * @example
 * ```tsx
 * // Uso en un dashboard de métricas
 * <CantCandidatos />
 *
 * // En una tarjeta de estadísticas
 * <div className="stats-card">
 *   <h3>Total Candidatos</h3>
 *   <CantCandidatos />
 * </div>
 * ```
 */
export default async function CantCandidatos() {
  /** Obtiene todos los usuarios desde la base de datos. */
  const snapshot = await get(ref(database, "usuarios"));

  /** Contador inicializado para llevar el total de candidatos. */
  let candidatos = 0;

  if (snapshot.exists()) {
    /** Datos de todos los usuarios obtenidos de la base de datos. */
    const usuarios = snapshot.val();

    // Itera sobre todos los usuarios para contar los candidatos
    for (const key in usuarios) {
      if (usuarios[key].rol === "candidato") {
        candidatos++;
      }
    }
  }

  return (
    <div className="flex flex-col">
      <span className="text-xl text-gray-700">
        <strong className="text-3xl text-[#212529]">{candidatos}</strong>
      </span>
    </div>
  );
}
