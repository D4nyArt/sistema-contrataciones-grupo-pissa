/**
 * seguimiento.tsx
 *
 * Proporciona un botón toggle para que el personal de RH gestione el seguimiento de candidatos.
 *
 * Este componente permite al personal de Recursos Humanos iniciar y cancelar el seguimiento
 * de candidatos específicos mediante un botón interactivo que cambia de estado. Mantiene
 * relaciones bidireccionales en Firebase Realtime Database entre RH y candidatos, con
 * efectos visuales dinámicos que indican el estado actual del seguimiento y permiten
 * alternar entre seguir y dejar de seguir con feedback visual inmediato.
 */

"use client";
import { useEffect, useState } from "react";
import { ref, get, update, remove } from "firebase/database";
import { database } from "@/firebaseConfig";

/**
 * Renderiza un botón toggle para gestionar el seguimiento de candidatos por parte del RH.
 *
 * Este componente proporciona una interfaz interactiva que permite al personal de RH
 * establecer o cancelar el seguimiento de candidatos específicos. Verifica automáticamente
 * el estado actual del seguimiento al cargar y mantiene sincronización bidireccional:
 * - Asigna/remueve el RH como revisor del candidato
 * - Añade/elimina el candidato de la lista de seguimiento del RH
 * - Proporciona feedback visual dinámico con cambios de color en hover
 * - Muestra diferentes textos según el estado (Seguir/Siguiendo/Dejar de seguir)
 *
 * @param props - Las propiedades del componente.
 * @param props.rhUID - El ID único del usuario de RH que gestiona el seguimiento.
 * @param props.candidateUID - El ID único del candidato a seguir o dejar de seguir.
 * @returns El elemento JSX que renderiza el botón toggle de seguimiento.
 *
 * @example
 * ```tsx
 * // Uso en tabla de candidatos
 * <tr>
 *   <td>{candidate.nombre}</td>
 *   <td>{candidate.email}</td>
 *   <td>
 *     <SeguimientoToggle
 *       rhUID={currentRhUser.uid}
 *       candidateUID={candidate.id}
 *     />
 *   </td>
 * </tr>
 *
 * // En lista de candidatos con seguimiento dinámico
 * {candidates.map(candidate => (
 *   <div key={candidate.id} className="candidate-card">
 *     <CandidateInfo candidate={candidate} />
 *     <SeguimientoToggle
 *       rhUID={rhUser.uid}
 *       candidateUID={candidate.id}
 *     />
 *   </div>
 * ))}
 *
 * // En perfil de candidato individual
 * <div className="candidate-profile">
 *   <CandidateDetails />
 *   <SeguimientoToggle
 *     rhUID={authenticatedRH.uid}
 *     candidateUID={candidateProfile.id}
 *   />
 * </div>
 * ```
 */
interface Props {
  rhUID: string;
  candidateUID: string;
}

export default function SeguimientoToggle({ rhUID, candidateUID }: Props) {
  /** Estado que indica si el RH está siguiendo actualmente al candidato (null = cargando). */
  const [estaSiguiendo, setEstaSiguiendo] = useState<boolean | null>(null);

  /** Estado que controla los efectos visuales durante el hover del mouse. */
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    /**
     * Verifica el estado actual del seguimiento consultando Firebase Database.
     *
     * Esta función consulta el campo 'revisor' del candidato para determinar
     * si el RH actual está siguiendo a este candidato específico. Actualiza
     * el estado local para reflejar la situación actual del seguimiento.
     */
    const verificarSeguimiento = async () => {
      const snapshot = await get(
        ref(database, `usuarios/${candidateUID}/revisor`)
      );
      const revisor = snapshot.val();
      setEstaSiguiendo(revisor === rhUID);
    };
    verificarSeguimiento();
  }, [rhUID, candidateUID]);

  /**
   * Inicia el seguimiento del candidato por parte del RH.
   *
   * Esta función establece la relación bidireccional de seguimiento:
   * 1. Asigna el RH como revisor del candidato
   * 2. Añade el candidato a la lista 'revisando' del RH con timestamp
   * 3. Actualiza el estado local para reflejar el cambio
   */
  const realizarSeguimiento = async () => {
    await update(ref(database, `usuarios/${candidateUID}`), {
      revisor: rhUID,
    });

    const now = Date.now();
    await update(ref(database, `usuarios/${rhUID}/revisando`), {
      [candidateUID]: now,
    });

    setEstaSiguiendo(true);
  };

  /**
   * Cancela el seguimiento del candidato por parte del RH.
   *
   * Esta función deshace la relación de seguimiento:
   * 1. Marca el revisor del candidato como "sin_revisor"
   * 2. Elimina el candidato de la lista 'revisando' del RH
   * 3. Actualiza el estado local para reflejar el cambio
   */
  const cancelarSeguimiento = async () => {
    await update(ref(database, `usuarios/${candidateUID}`), {
      revisor: "sin_revisor",
    });

    await remove(ref(database, `usuarios/${rhUID}/revisando/${candidateUID}`));

    setEstaSiguiendo(false);
  };

  if (estaSiguiendo === null) {
    return (
      <div className=" flex items-center justify-center border-2 border-gray-500 text-[#212529] rounded-lg cursor-pointer mr-2 py-2 px-4 w-40">
        Seguir
      </div>
    );
  }

  if (estaSiguiendo) {
    return (
      <button
        onClick={cancelarSeguimiento}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={`${
          hovering
            ? "text-red-700 bg-red-100 border-red-500"
            : "border-2 border-[#2d4583]"
        }  text-[#2d4583] rounded-lg cursor-pointer mr-2 py-2 px-4 transition-all duration-200 border-2 w-40`}
      >
        {hovering ? "Dejar de seguir" : "Siguiendo"}
      </button>
    );
  }

  return (
    <button
      onClick={realizarSeguimiento}
      className="border-2 border-gray-500 text-[#212529] rounded-lg cursor-pointer mr-2 py-2 px-4 w-40 hover:text-[#08b177] hover:border-[#08b177]"
    >
      Seguir
    </button>
  );
}
