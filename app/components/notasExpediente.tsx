import React, { useState, useEffect } from 'react';

interface NotasExpedienteProps {
  role: string;
  expedienteId: string;
}

const NotasExpediente: React.FC<NotasExpedienteProps> = ({ role, expedienteId }) => {
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const canEdit = role === "rh";

  // Cargar notas al montar el componente
  useEffect(() => {
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

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
  };

  const saveNotes = async () => {
    if (!expedienteId) return;

    setSaving(true);
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          expedienteId,
          notes
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Se han guardado las notas exitosamente!");
      } else {
        alert(`Error: ${result.error || 'No se pudieron guardar las notas'}`);
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
            className={`w-full p-2 border rounded-md ${role === "candidato" ? "bg-gray-50" : ""}`}
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