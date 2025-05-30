// Este es dashboard inicial para el historial

import { database } from "@/firebaseConfig";
import { get, ref } from "firebase/database";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function History() {
  const pathname = usePathname();
  const uid = pathname.split("/")[2];

  const [historial, setHistory] = useState<{
    contrasena?: any;
    documentos?: any;
    contratos?: any;
    onboarding?: any;
  }>({});

  useEffect(() => {
    const fetchHistory = async () => {
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
          <h3 className="text-lg font-semibold mt-4">{categoryName}</h3>
          <p className="text-sm text-gray-500">No hay entradas registradas.</p>
        </div>
      );
    }

    return (
      <div key={categoryName}>
        <h3 className="text-lg font-semibold mt-6 mb-2 capitalize">{categoryName}</h3>
        <ul className="space-y-2">
          {Object.entries(entries).map(([key, entry]: any) => (
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
