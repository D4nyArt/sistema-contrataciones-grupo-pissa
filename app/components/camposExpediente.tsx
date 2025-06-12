/**
 * camposExpediente.tsx
 *
 * Proporciona un componente para gestionar campos de información adicional en documentos de expedientes.
 *
 * Este módulo permite a los candidatos llenar campos específicos requeridos para documentos
 * de su expediente, y al personal de RH revisar, aprobar o rechazar esa información.
 * Incluye validación automática de estados, actualización en tiempo real y notificaciones
 * de cambios a través del sistema.
 */

import React, { useState, useEffect } from "react";
import { Check, X, Clock, ThumbsUp, ThumbsDown } from "lucide-react";

/**
 * Define las propiedades del componente CamposExpediente.
 */
interface CamposExpedienteProps {
  /** El rol del usuario actual (determina los permisos de edición y revisión). */
  role: string;

  /** El ID del expediente al que pertenecen los campos. */
  expedienteId: string;

  /** El ID del documento específico dentro del expediente. */
  documentoId: string;

  /** Función callback que se ejecuta cuando cambia el estado de los campos. */
  onChangeState: () => void;
}

/**
 * Define la estructura de datos de un campo.
 */
interface FieldData {
  /** El nombre descriptivo del campo. */
  nombre: string;

  /** El estado actual del campo (aprobado, pendiente, rechazado, no_subido). */
  estado: string;

  /** El valor ingresado por el candidato. */
  valor: string;
}

/**
 * Define los posibles estados de un campo.
 */
type FieldState = "aprobado" | "pendiente" | "rechazado" | "no_subido";

/** Mapeo de constantes para los estados de campo. */
const FIELD_STATES: Record<string, FieldState> = {
  APROBADO: "aprobado",
  PENDIENTE: "pendiente",
  RECHAZADO: "rechazado",
  NO_SUBIDO: "no_subido",
};

/**
 * Renderiza un componente para gestionar campos de información adicional en expedientes.
 *
 * Este componente proporciona una interfaz diferenciada por rol: los candidatos pueden
 * llenar y modificar valores de campos, mientras que el personal de RH puede revisar,
 * aprobar o rechazar cada campo individualmente. Incluye validación automática de
 * estados globales y persistencia de cambios en tiempo real.
 *
 * @param props - Las propiedades del componente.
 * @param props.role - El rol del usuario actual que determina los permisos.
 * @param props.expedienteId - El ID del expediente contenedor.
 * @param props.documentoId - El ID específico del documento.
 * @param props.onChangeState - Callback ejecutado cuando cambian los estados.
 * @returns El elemento JSX que renderiza la gestión de campos.
 *
 * @example
 * ```tsx
 * // Para un candidato llenando información de su cédula
 * <CamposExpediente
 *   role="candidato"
 *   expedienteId="user123"
 *   documentoId="cedula"
 *   onChangeState={() => refreshDocument()}
 * />
 *
 * // Para personal de RH revisando campos
 * <CamposExpediente
 *   role="rh"
 *   expedienteId="user123"
 *   documentoId="diploma"
 *   onChangeState={() => updateDocumentList()}
 * />
 * ```
 */
const CamposExpediente: React.FC<CamposExpedienteProps> = ({
  role,
  expedienteId,
  documentoId,
  onChangeState,
}) => {
  /** Estado que almacena todos los campos del documento con su información. */
  const [fields, setFields] = useState<Record<string, FieldData>>({});

  /** Determina si el usuario actual puede editar/revisar campos. */
  const canEdit = role === "admin" || role === "rh";

  useEffect(() => {
    /**
     * Obtiene los campos del documento desde el servidor.
     *
     * Esta función consulta la API para recuperar todos los campos
     * asociados al documento específico del expediente.
     */
    const fetchFields = async () => {
      if (!expedienteId || !documentoId) return;
      try {
        const response = await fetch(
          `/api/fields?expedienteId=${expedienteId}&documentoId=${documentoId}`
        );

        const data = await response.json();

        if (response.ok) {
          setFields(data.fields);
        } else {
          console.error("Error al obtener campos:", data.error);
        }
      } catch (error) {
        console.error("Error en la solicitud:", error);
      }
    };

    fetchFields();
  }, [expedienteId, documentoId]);

  /**
   * Guarda todos los cambios realizados en los campos por el candidato.
   *
   * Esta función procesa todos los campos, calcula el estado global basado
   * en los estados individuales, y persiste los cambios en la base de datos.
   * También notifica al componente padre sobre los cambios realizados.
   */
  const handleSaveFields = async (): Promise<void> => {
    if (!expedienteId || !documentoId) return;

    // 1. Payload de campos
    const camposPayload = Object.entries(fields).reduce(
      (acc, [key, { valor, estado }]) => {
        acc[key] = { valor, estado };
        return acc;
      },
      {} as Record<string, { valor: string; estado: string }>
    );

    // 2. Calcular estado global de campos
    const valores = Object.values(camposPayload);
    const allEmpty = valores.every((f) => f.valor.trim() === "");
    const anyRejected = valores.some(
      (f) => f.estado === FIELD_STATES.RECHAZADO
    );
    const allApproved = valores.every(
      (f) => f.estado === FIELD_STATES.APROBADO
    );

    const dbFieldsState = allEmpty
      ? FIELD_STATES.NO_SUBIDO
      : anyRejected
      ? FIELD_STATES.RECHAZADO
      : allApproved
      ? FIELD_STATES.APROBADO
      : FIELD_STATES.PENDIENTE;

    // 3. Persiste vía API
    try {
      const res = await fetch("/api/fields", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          expedienteId,
          documentoId,
          campos: camposPayload,
          estadoCampos: dbFieldsState,
        }),
      });
      if (!res.ok) throw await res.json();
      alert("Campos guardados correctamente");
      onChangeState();
    } catch (err) {
      console.error("Error al guardar campos:", err);
    }
  };

  /**
   * Maneja la revisión individual de un campo por parte del personal de RH.
   *
   * Esta función permite aprobar o rechazar un campo específico, actualiza
   * el estado local inmediatamente y persiste el cambio en la base de datos.
   *
   * @param fieldKey - La clave única del campo a revisar.
   * @param approved - Indica si el campo fue aprobado (true) o rechazado (false).
   */
  const handleFieldReview = async (
    fieldKey: string,
    approved: boolean
  ): Promise<void> => {
    if (!expedienteId || !documentoId) return;
    const newState = approved ? FIELD_STATES.APROBADO : FIELD_STATES.RECHAZADO;

    // 1. Actualiza localmente
    setFields((prev) => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], estado: newState },
    }));

    // 2. Persiste vía API
    try {
      const res = await fetch("/api/fields", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          expedienteId,
          documentoId,
          fieldKey,
          estado: newState,
        }),
      });
      if (!res.ok) throw await res.json();
      onChangeState();
    } catch (err) {
      console.error("Error al actualizar estado del campo:", err);
    }
  };

  /**
   * Maneja los cambios en el valor de un campo por parte del candidato.
   *
   * Esta función actualiza el valor del campo localmente y ajusta automáticamente
   * su estado basándose en si tiene contenido o está vacío.
   *
   * @param fieldKey - La clave única del campo que se está modificando.
   * @param value - El nuevo valor ingresado por el candidato.
   */
  const handleFieldChange = async (
    fieldKey: string,
    value: string
  ): Promise<void> => {
    if (!expedienteId || !documentoId) return;
    const newState =
      value.trim() === "" ? FIELD_STATES.NO_SUBIDO : FIELD_STATES.PENDIENTE;

    // 1. Actualiza localmente
    setFields((prev) => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        valor: value,
        estado: newState,
      },
    }));
  };

  return (
    <div>
      <div className="space-y-4">
        {Object.entries(fields).map(([key, { estado, nombre, valor }]) => (
          <div key={key} className="border border-gray-200 rounded-md p-3">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                {nombre}
              </label>

              {canEdit && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleFieldReview(key, true)}
                    className={`cursor-pointer p-1.5 rounded transition-colors ${
                      estado === FIELD_STATES.APROBADO
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700"
                    }`}
                    title="Aprobar campo"
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={() => handleFieldReview(key, false)}
                    className={`cursor-pointer p-1.5 rounded transition-colors ${
                      estado === FIELD_STATES.RECHAZADO
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700"
                    }`}
                    title="Rechazar campo"
                  >
                    <ThumbsDown size={14} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center">
              <input
                type="text"
                className={`w-full p-2 border rounded ${
                  estado === FIELD_STATES.APROBADO
                    ? "border-green-300 bg-green-50"
                    : estado === FIELD_STATES.RECHAZADO
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                value={valor}
                onChange={
                  // Solo permitir edición para candidato
                  role === "candidato"
                    ? (e) => handleFieldChange(key, e.target.value)
                    : undefined
                }
                readOnly={role !== "candidato"}
              />
              <span
                className={`ml-2 p-1 rounded-full ${
                  estado === FIELD_STATES.APROBADO
                    ? "bg-green-500"
                    : estado === FIELD_STATES.RECHAZADO
                    ? "bg-red-500"
                    : estado === FIELD_STATES.PENDIENTE
                    ? "bg-yellow-500"
                    : "bg-gray-300"
                }`}
              >
                {estado === FIELD_STATES.APROBADO ? (
                  <Check size={12} className="text-white" />
                ) : estado === FIELD_STATES.RECHAZADO ? (
                  <X size={12} className="text-white" />
                ) : estado === FIELD_STATES.PENDIENTE ? (
                  <Clock size={12} className="text-white" />
                ) : (
                  <X size={12} className="text-white" />
                )}
              </span>
            </div>
          </div>
        ))}

        {role === "candidato" && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveFields}
              className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Guardar Cambios
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CamposExpediente;
