import React, {useState, useEffect} from 'react';

import {
  Check,
  X,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";


interface CamposExpedienteProps {
  role: string,
  expedienteId: string,
  documentoId: string
  onChangeState: () => void;
}

interface FieldData {
  nombre: string;
  estado: string;
  valor: string;
}

type FieldState = "aprobado" | "pendiente" | "rechazado" | "no_subido";


const FIELD_STATES: Record<string, FieldState> = {
  APROBADO: "aprobado",
  PENDIENTE: "pendiente",
  RECHAZADO: "rechazado",
  NO_SUBIDO: "no_subido",
};

const CamposExpediente: React.FC<CamposExpedienteProps> = ({role, expedienteId, documentoId, onChangeState}) => {
  const [fields, setFields] = useState<Record<string, FieldData>>({});

  const canEdit = role === "admin" || role === "rh";

  useEffect(() => {
    const fetchFields = async () => {
      if (!expedienteId || !documentoId) return;
      try {
        const response = await fetch(`/api/fields?expedienteId=${expedienteId}&documentoId=${documentoId}`);

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
    const allEmpty    = valores.every(f => f.valor.trim() === "");
    const anyRejected = valores.some(f => f.estado === FIELD_STATES.RECHAZADO);
    const allApproved = valores.every(f => f.estado === FIELD_STATES.APROBADO);
  
    const dbFieldsState = allEmpty
      ? FIELD_STATES.NO_SUBIDO
      : anyRejected
        ? FIELD_STATES.RECHAZADO
        : allApproved
          ? FIELD_STATES.APROBADO
          : FIELD_STATES.PENDIENTE;
  
    // 3. Persiste vía API
    try {
      const res = await fetch('/api/fields', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expedienteId,
          documentoId,
          campos: camposPayload,
          estadoCampos: dbFieldsState
        })
      });
      if (!res.ok) throw await res.json();
      alert("Campos guardados correctamente");
      onChangeState();
    } catch (err) {
      console.error("Error al guardar campos:", err);
    }
  };

  const handleFieldReview = async (
    fieldKey: string,
    approved: boolean
  ): Promise<void> => {
    if (!expedienteId || !documentoId) return;
    const newState = approved
      ? FIELD_STATES.APROBADO
      : FIELD_STATES.RECHAZADO;
  
    // 1. Actualiza localmente
    setFields(prev => ({
      ...prev,
      [fieldKey]: { ...prev[fieldKey], estado: newState }
    }));
  
    // 2. Persiste vía API
    try {
      const res = await fetch('/api/fields', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expedienteId,
          documentoId,
          fieldKey,
          estado: newState
        })
      });
      if (!res.ok) throw await res.json();
      console.log(`Campo "${fieldKey}" marcado como "${newState}"`);
      onChangeState();
    } catch (err) {
      console.error('Error al actualizar estado del campo:', err);
    }
  };
  
  const handleFieldChange = async (
    fieldKey: string,
    value: string
  ): Promise<void> => {
    if (!expedienteId || !documentoId) return;
    const newState =
      value.trim() === "" ? FIELD_STATES.NO_SUBIDO : FIELD_STATES.PENDIENTE;
  
    // 1. Actualiza localmente
    setFields(prev => ({
      ...prev,
      [fieldKey]: {
        ...prev[fieldKey],
        valor: value,
        estado: newState
      }
    }));
  };

  return (
    <div>
      <div className="space-y-4">
        {Object.entries(fields).map(([key, {estado, nombre, valor}]) => (
          <div
            key={key}
            className="border border-gray-200 rounded-md p-3"
          >
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                {nombre}
              </label>

              {canEdit && (
                <div className="flex space-x-1">
                  <button
                    onClick={() =>
                      handleFieldReview(key, true)
                    }
                    className={`p-1.5 rounded transition-colors ${estado === FIELD_STATES.APROBADO
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 hover:bg-green-100 text-gray-700 hover:text-green-700"
                      }`}
                    title="Aprobar campo"
                  >
                    <ThumbsUp size={14} />
                  </button>
                  <button
                    onClick={() =>
                      handleFieldReview(key, false)
                    }
                    className={`p-1.5 rounded transition-colors ${estado === FIELD_STATES.RECHAZADO
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
                className={`w-full p-2 border rounded ${estado === FIELD_STATES.APROBADO
                  ? "border-green-300 bg-green-50"
                  : estado === FIELD_STATES.RECHAZADO
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                  }`}
                value={valor}
                onChange={
                  // Solo permitir edición para candidato
                  role === "candidato"
                    ? (e) =>
                      handleFieldChange(key, e.target.value)
                    : undefined
                }
                readOnly={role === "admin"}
              />
              <span
                className={`ml-2 p-1 rounded-full ${estado === FIELD_STATES.APROBADO
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
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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