/**
 * cancelarseguimiento.tsx
 *
 * Proporciona un componente para cancelar el seguimiento de candidatos por parte del personal de RH.
 *
 * Este módulo permite al personal de RH dejar de seguir candidatos específicos, eliminando
 * la relación de revisión entre el revisor y el candidato. Actualiza tanto el campo revisor
 * del candidato como la lista de candidatos en seguimiento del personal de RH.
 */

"use client";
import { ref, update, remove } from "firebase/database";
import { database } from "../../firebaseConfig";

/**
 * Define las propiedades del componente CancelarSeguimiento.
 */
interface CancelarSeguimientoProps {
  /** El ID único del personal de RH que cancela el seguimiento. */
  rhUID: string;

  /** El ID único del candidato al que se dejará de seguir. */
  candidateUID: string;
}

/**
 * Renderiza un botón para cancelar el seguimiento de un candidato específico.
 *
 * Este componente permite al personal de RH dejar de seguir a un candidato,
 * rompiendo la relación de revisión establecida. Al ejecutarse, limpia el
 * campo revisor del candidato y elimina la entrada correspondiente de la
 * lista de candidatos en seguimiento del personal de RH.
 *
 * @param props - Las propiedades del componente.
 * @param props.rhUID - El ID del personal de RH que cancela el seguimiento.
 * @param props.candidateUID - El ID del candidato que dejará de ser seguido.
 * @returns El elemento JSX que renderiza el botón de cancelar seguimiento.
 *
 * @example
 * ```tsx
 * // Cancelar seguimiento de un candidato específico
 * <CancelarSeguimiento
 *   rhUID="rh123"
 *   candidateUID="candidate456"
 * />
 *
 * // En una lista de candidatos seguidos
 * {candidatesList.map(candidate => (
 *   <div key={candidate.id}>
 *     <span>{candidate.name}</span>
 *     <CancelarSeguimiento
 *       rhUID={currentRHUser.id}
 *       candidateUID={candidate.id}
 *     />
 *   </div>
 * ))}
 * ```
 */
export default function CancelarSeguimiento({
  rhUID,
  candidateUID,
}: CancelarSeguimientoProps) {
  /**
   * Maneja la cancelación del seguimiento del candidato.
   *
   * Esta función realiza dos operaciones principales:
   * 1. Actualiza el campo revisor del candidato a "sin_revisor"
   * 2. Elimina la entrada del candidato de la lista de seguimiento del RH
   *
   * Después de completar las operaciones, muestra una confirmación al usuario.
   */
  const handleClick = async (): Promise<void> => {
    try {
      // 1) Limpiar el revisor del candidato
      await update(ref(database, `usuarios/${candidateUID}`), {
        revisor: "sin_revisor",
      });

      // 2) Eliminar completamente el campo de la lista de seguimiento del RH
      await remove(
        ref(database, `usuarios/${rhUID}/revisando/${candidateUID}`)
      );

      alert(`Se ha dejado de seguir a ${candidateUID}`);
    } catch (error) {
      console.error("Error al cancelar seguimiento:", error);
      alert("Error al cancelar el seguimiento. Inténtalo de nuevo.");
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-red-600 text-white rounded-lg cursor-pointer mr-2 py-2 px-4 hover:bg-red-700 transition-colors"
      aria-label={`Dejar de seguir al candidato ${candidateUID}`}
    >
      Dejar de seguir
    </button>
  );
}
