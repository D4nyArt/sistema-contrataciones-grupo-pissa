// Aquí va la lógica del historial con la API
/* 1. Generar al usuario dentro de la base de datos "historial"
        a. La primera vez que incia sesión 
        b. Todos los campos inicializados en vacío 

    2.  Guardar dentro del historial 
        Parámetros: (UID, clasificacion, fecha(string), rh?, nota? )
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
        contrasena: {
            init: {
            id: "PI",
            detalles: "creación",
            fecha: now
            }
        },
        documentos: {},
        contratos: {},
        onboarding: {}
        };

        await set(historyRef, initialStructure);
        console.log("History structure created for user:", uid);
    } else {
        console.log("User history already exists:", uid);
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
    const historyRef = ref(db, `historial/${uid}/${category}`);
  
    const newEntry = {
      date,
      ...(rh && { registeredBy: rh }),
      ...(note && { note })
    };
  
    try {
      await push(historyRef, newEntry);
      console.log(`Event added to ${category} history for user: ${uid}`);
    } catch (error) {
      console.error("Error adding history entry:", error);
    }
  }