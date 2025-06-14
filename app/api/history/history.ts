// Aquí va la lógica del historial con la API
/* 1. Generar al usuario dentro de la base de datos "historial"
        a. La primera vez que incia sesión 
        b. Todos los campos inicializados en vacío 

    2.  Guardar dentro del historial 
        Parámetros: (UID, clasificacion, fecha(string), rh?, nota? )
 
 
 PENDIENTES:
  c) Generación de un PID (password ID) descriptivo
            *** No utilizar el que tiene firebase por defecto  
 
*/        
import { getDatabase, ref, get, set, push } from "firebase/database";

export async function initializeUserHistory(uid: string) {
    const db = getDatabase();
    const historyRef = ref(db, `historial/historial${uid}`);

    const dateObj = new Date();
    const tcmDate = dateObj.toLocaleString("es-MX", { 
      timeZone: "America/Mexico_City",
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    // Formatear la fecha 
    const [datePart, timePart] = tcmDate.split(', ');
    const formattedDate = `${datePart} (${timePart})`;

    try {
    const snapshot = await get(historyRef);

    if (!snapshot.exists()) {

        const initialStructure = {
        contrasenas: {
            init: {
              date: formattedDate,
            note: "Creación"
            }
        },
        documentos: {},
        contratos: {},
        onboarding: {}
        };

        await set(historyRef, initialStructure);
    }
    } catch (error) {
    console.error("Error creating user history:", error);
    }
}

// Función utilitaria para obtener el email desde un UID
async function getEmailFromUID(rhid: string): Promise<string | null> {
  const db = getDatabase();
  const userRef = ref(db, `usuarios/${rhid}/email`);
  const snap = await get(userRef);
  return snap.exists() ? snap.val() : null;
}

export async function addHistoryEntry(
    uid: string,
    category: "contrasenas" | "documentos" | "contratos" | "onboarding",
    date: string,
    rh?: string,
    note?: string
  ) {
    const db = getDatabase();
    const historyRef = ref(db, `historial/historial${uid}/${category}`);
  
    let registeredByEmail: string | undefined = undefined;
    if (rh) {
      registeredByEmail = await getEmailFromUID(rh) || undefined;
    }

    // Convertir la fecha a zona horaria TCM y formatear
    const dateObj = new Date(date);
    const tcmDate = dateObj.toLocaleString("es-MX", { 
      timeZone: "America/Mexico_City",
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    
    // Formatear la fecha 
    const [datePart, timePart] = tcmDate.split(', ');
    const formattedDate = `${datePart} (${timePart})`;

    const newEntry = {
      date: formattedDate,
      ...(registeredByEmail && { registeredBy: registeredByEmail }),
      ...(note && { note })
    };
  
    try {
      await push(historyRef, newEntry);
    } catch {}
  }