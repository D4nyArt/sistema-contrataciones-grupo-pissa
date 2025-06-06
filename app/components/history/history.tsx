// Este es dashboard inicial para el historial

import { database } from "@/firebaseConfig";
import { get, ref } from "firebase/database";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const categoryNames: Record<string, string> = {
  contrasenas: "Contraseñas",
  documentos: "Documentos",
  contratos: "Contratos",
  onboarding: "Onboarding"
};

export default function History() {
  const pathname = usePathname();
  const [uid, setUid] = useState<string | null>(null);
  const [historial, setHistory] = useState<{
    contrasenas?: any;
    documentos?: any;
    contratos?: any;
    onboarding?: any;
  }>({});

  useEffect(() => {
    // Obtener el UID de la URL
    const pathUid = pathname.split("/")[2];
    setUid(pathUid);
  }, [pathname]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!uid) return; // No hacer la petición si no hay UID

      try {
        const historyRef = ref(database, `historial/historial${uid}`);
        const snapshot = await get(historyRef);
        const data = snapshot.val() || {};
        setHistory(data);
      } catch (e) {
        console.error("Error fetching history:", e);
      }
    };
    fetchHistory();
  }, [uid]);

  const renderCategory = (categoryName: string, entries: any) => {
    if (!entries || Object.keys(entries).length === 0) {
      return (
        <div key={categoryName}>
          <h3 className="text-lg font-semibold mt-4">{categoryNames[categoryName] || categoryName}</h3>
          <p className="text-sm text-gray-500">No hay entradas registradas.</p>
        </div>
      );
    }

    // Convertir las entradas a un array y ordenarlas por fecha
    const sortedEntries = Object.entries(entries).sort(([, a]: any, [, b]: any) => {
      const parseTime = (timeStr: string) => {
        const timeMatch = timeStr.match(/\((\d{1,2}):(\d{2}) (a\.m\.|p\.m\.)\)/);
        if (!timeMatch) return 0;
        
        let [_, hours, minutes, period] = timeMatch;
        let hour = parseInt(hours);
        
        if (period === 'p.m.' && hour !== 12) hour += 12;
        if (period === 'a.m.' && hour === 12) hour = 0;
        
        return hour * 60 + parseInt(minutes);
      };

      const timeA = parseTime(a.date);
      const timeB = parseTime(b.date);
      
      return timeB - timeA;
    });

    return (
      <div key={categoryName}>
        <h3 className="text-lg font-semibold mt-6 mb-2">{categoryNames[categoryName] || categoryName}</h3>
        <ul className="space-y-2">
          {sortedEntries.map(([key, entry]: any) => (
            <li
              key={key}
              className="p-3 bg-gray-50 border border-gray-200 rounded-md shadow-sm"
            >
              <p className="text-sm">
                <strong>Fecha:</strong> {entry.date}
              </p>
              {entry.registeredBy && (
                <p className="text-sm">
                  <strong>RH:</strong> {entry.registeredBy}
                </p>
              )}
              {entry.note && (
                <p className="text-sm">
                  <strong>Nota:</strong> {entry.note}
                </p>
              )}
              {entry.type && (
                <p className="text-sm">
                  <strong>Tipo:</strong> {entry.type}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (!uid) {
    return <div>Cargando...</div>;
  }

  return (
    <main className="bg-white rounded-xl p-6 shadow-md">
      <h2 className="text-2xl font-bold mb-4">Historial del Usuario</h2>
      <div>
        {Object.entries(historial).map(([category, entries]) =>
          renderCategory(category, entries)
        )}
      </div>
    </main>
  );
}
