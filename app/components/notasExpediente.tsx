/**
 * notasExpediente.tsx
 *
 * Proporciona funcionalidad de gestión de notas para expedientes de candidatos.
 *
 * Este componente permite al personal de RH agregar, editar y visualizar notas
 * sobre expedientes de candidatos, mientras que los candidatos pueden ver las
 * notas en modo de solo lectura. Incluye carga automática de notas existentes,
 * guardado asíncrono y manejo de estados de carga para una experiencia de
 * usuario fluida en la gestión de información adicional del expediente.
 */

import React, { useState, useEffect } from "react";

/**
 * Define las propiedades del componente NotasExpediente.
 */
interface NotasExpedienteProps {
  /** El rol del usuario que determina los permisos de edición. */
  role: string;

  /** El ID del expediente al que pertenecen las notas. */
  expedienteId: string;
}

/**
 * Renderiza un componente de gestión de notas para expedientes de candidatos.
 *
 * Este componente proporciona funcionalidad diferenciada según el rol del usuario:
 * para personal de RH permite crear, editar y guardar notas sobre candidatos,
 * mientras que para candidatos ofrece visualización en modo de solo lectura.
 * Incluye carga automática de notas existentes desde la API, guardado asíncrono
 * con indicadores de estado y manejo de errores para garantizar una experiencia
 * de usuario robusta en la gestión de información adicional del expediente.
 *
 * @param props - Las propiedades del componente.
 * @param props.role - El rol del usuario ("rh" permite edición, otros roles solo lectura).
 * @param props.expedienteId - El ID único del expediente asociado a las notas.
 * @returns El elemento JSX que renderiza la interfaz de gestión de notas.
 *
 * @example
 * ```tsx
 * // Uso para personal de RH (con permisos de edición)
 * <NotasExpediente
 *   role="rh"
 *   expedienteId="user123"
 * />
 *
 * // Uso para candidatos (solo lectura)
 * <NotasExpediente
 *   role="candidato"
 *   expedienteId="user123"
 * />
 *
 * // En vista de expediente
 * <div className="expediente-section">
 *   <DocumentsList />
 *   <NotasExpediente
 *     role={currentUserRole}
 *     expedienteId={expedienteId}
 *   />
 * </div>
 * ```
 */
const NotasExpediente: React.FC<NotasExpedienteProps> = ({
  role,
  expedienteId,
}) => {
  /** Estado que almacena el contenido de las notas. */
  const [notes, setNotes] = useState<string>("");

  /** Estado que indica si se están cargando las notas desde la API. */
  const [loading, setLoading] = useState<boolean>(false);

  /** Estado que indica si se está guardando una actualización de notas. */
  const [saving, setSaving] = useState<boolean>(false);

  /** Determina si el usuario actual puede editar las notas basándose en su rol. */
  const canEdit = role === "rh";

  useEffect(() => {
    /**
     * Obtiene las notas existentes del expediente desde la API.
     *
     * Esta función se ejecuta al montar el componente y consulta el endpoint
     * de notas para cargar cualquier contenido previamente guardado. Maneja
     * la carga asíncrona y actualiza el estado local con las notas obtenidas.
     */
    const fetchNotes = async () => {
      if (!expedienteId) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/notes?expedienteId=${expedienteId}`);
        const data = await response.json();

        if (response.ok) {
          setNotes(data.notes || "");
        } else {
          console.error("Error al obtener notas:", data.error);
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [expedienteId]);

  /**
   * Maneja los cambios en el contenido del textarea de notas.
   *
   * Esta función actualiza el estado local cuando el usuario escribe
   * en el campo de notas, proporcionando feedback inmediato.
   *
   * @param e - El evento de cambio del textarea.
   */
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  /**
   * Guarda las notas en la base de datos a través de la API.
   *
   * Esta función envía el contenido actual de las notas al servidor
   * para su persistencia. Incluye manejo de estados de carga, gestión
   * de errores y notificaciones al usuario sobre el resultado de la
   * operación de guardado.
   */
  const saveNotes = async () => {
    if (!expedienteId) return;

    setSaving(true);
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expedienteId,
          notes,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Se han guardado las notas exitosamente!");
      } else {
        alert(`Error: ${result.error || "No se pudieron guardar las notas"}`);
      }
    } catch (error) {
      console.error("Error al guardar notas:", error);
      alert("Error al guardar las notas. Intente nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">
        {role === "candidato" ? "Notas" : "Notas del candidato"}
      </h3>
      {loading ? (
        <div className="text-center py-4">Cargando notas...</div>
      ) : (
        <>
          <textarea
            className={`w-full p-2 border rounded-md ${
              role === "candidato" ? "bg-gray-50" : ""
            }`}
            rows={4}
            value={notes}
            onChange={canEdit ? handleNotesChange : undefined}
            placeholder={
              role === "rh"
                ? "Añadir notas sobre este candidato..."
                : "No hay notas disponibles"
            }
            readOnly={!canEdit}
          />
          {canEdit && (
            <button
              onClick={saveNotes}
              disabled={saving}
              className={`cursor-pointer mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
                saving ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {saving ? "Guardando..." : "Guardar Notas"}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default NotasExpediente;
