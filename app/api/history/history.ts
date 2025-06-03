// Aquí va la lógica del historial con la API
/* 1. Generar al usuario dentro de la base de datos "historial"
        a. La primera vez que incia sesión 
        b. Todos los campos inicializados en vacío 

    2.  Guardar dentro del historial 
        Parámetros: (UID, clasificacion, fecha(string), rh?, nota? )
 
 
 PENDIENTES:

  a) Parseo del UID del RH 
  b) Parseo de la fecha 
  c) Generación de un PID (password ID) descriptivo
            *** No utilizar el que tiene firebase por defecto  
 
*/        
import { getDatabase, ref, get, set, push } from "firebase/database";

export async function initializeUserHistory(uid: string) {
    const db = getDatabase();
    const historyRef = ref(db, `historial/historial${uid}`);

    try {
    const snapshot = await get(historyRef);

    if (!snapshot.exists()) {
        const now = new Date().toISOString();

        const initialStructure = {
        contrasenas: {
            init: {
              date: now,
            note: "creación"
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


export async function addHistoryEntry(
    uid: string,
    category: "contrasenas" | "documentos" | "contratos" | "onboarding",
    date: string,
    rh?: string,
    note?: string
  ) {
    const db = getDatabase();
    const historyRef = ref(db, `historial/historial${uid}/${category}`);
  
    const newEntry = {
      date,
      ...(rh && { registeredBy: rh }),
      ...(note && { note })
    };
  
    try {
      await push(historyRef, newEntry);
    } catch (error) {
      console.error("Error adding history entry:", error);
    }
  }