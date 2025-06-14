/**
 * candidatoSeguidos.tsx
 *
 * Proporciona un componente para mostrar y gestionar la lista de candidatos en seguimiento por RH.
 *
 * Este módulo permite al personal de RH visualizar todos los candidatos que están actualmente
 * bajo su revisión. Incluye autenticación automática, carga asíncrona de datos desde la API
 * y manejo de estados de carga, error y lista vacía con interfaces apropiadas.
 */

"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { urbanist } from "./fonts";
import TablaRevisando from "./tablaSeguidos";
import SeguidosSkeleton from "./tablaSeguidosSkeleton";

/**
 * Define la estructura de datos de un candidato en seguimiento.
 */
interface RevisandoEntry {
  /** El ID único del candidato. */
  candidateUID: string;

  /** La fecha desde cuando se inició el seguimiento. */
  since: string;

  /** El nombre del candidato. */
  nombre: string;

  /** Los apellidos del candidato. */
  apellidos: string;

  /** El estado actual del usuario (normal, bloqueado, baja, etc.). */
  estadoUsuario: string;

  /** La dirección de email del candidato. */
  email: string;
}

/**
 * Renderiza la lista de candidatos que están siendo seguidos por el personal de RH autenticado.
 *
 * Este componente gestiona automáticamente la autenticación del usuario, obtiene la lista
 * de candidatos en seguimiento desde la API y presenta los datos en una tabla interactiva.
 * Incluye estados de carga con skeleton, manejo de errores y vista de lista vacía.
 *
 * @returns El elemento JSX que renderiza la lista de candidatos en seguimiento.
 *
 * @example
 * ```tsx
 * // Uso en el dashboard de RH
 * <RevisandoList />
 *
 * // El componente automáticamente:
 * // 1. Verifica la autenticación del usuario
 * // 2. Obtiene la lista de candidatos seguidos
 * // 3. Muestra los datos en una tabla interactiva
 * // 4. Maneja estados de carga y error apropiadamente
 * ```
 *
 * @see {@link TablaRevisando} - Componente que renderiza la tabla con los datos de candidatos
 * @see {@link SeguidosSkeleton} - Componente skeleton mostrado durante la carga
 */
export default function RevisandoList() {
  /** Estado que almacena la lista de candidatos en seguimiento. */
  const [revisando, setRevisando] = useState<RevisandoEntry[]>([]);

  /** Estado que indica si los datos están siendo cargados. */
  const [loading, setLoading] = useState(true);

  /** Estado que almacena mensajes de error si ocurren. */
  const [error, setError] = useState<string | null>(null);

  /** Estado que almacena la información del usuario autenticado. */
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    /**
     * Configura el listener de autenticación para monitorear cambios.
     *
     * Este efecto se ejecuta al montar el componente y establece un listener
     * que reacciona a cambios en el estado de autenticación del usuario.
     */
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setError("Usuario no autenticado.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    /**
     * Obtiene la lista de candidatos seguidos desde la API.
     *
     * Este efecto se ejecuta cuando el usuario está autenticado y hace
     * una petición a la API para obtener todos los candidatos que están
     * siendo seguidos por el usuario actual.
     */
    if (!user) return;

    fetch(`/api/getFollowed?rhUID=${user.uid}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRevisando(data);
        } else {
          setError(data?.error || "Error desconocido");
        }
      })
      .catch((err) => setError("Error de red: " + err.message))
      .finally(() => setLoading(false));
  }, [user]);

  // Estados de renderizado condicional
  if (loading) return <SeguidosSkeleton />;
  if (error) return <p>Error: {error}</p>;
  if (revisando.length === 0)
    return (
      <div className="flex flex-col h-full">
        <h2
          className={`${urbanist.className} text-[#212529] font-bold text-2xl mb-4`}
        >
          Candidatos en revisión
        </h2>
        <p className="flex justify-center items-center w-full h-full">
          No hay candidatos en revisión.
        </p>
      </div>
    );

  return (
    <>
      <h2
        className={`${urbanist.className} text-[#212529] font-bold text-2xl mb-4 animate-fade-in-up`}
      >
        Candidatos en revisión
      </h2>
      <TablaRevisando datos={revisando} />
    </>
  );
}
