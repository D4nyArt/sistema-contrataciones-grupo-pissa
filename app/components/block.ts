// app/utils/userActions.ts
import { ref, set } from "firebase/database";
import { database } from "../../firebaseConfig";

export const handleBlock = async (userId: string, setStatus: (v: string) => void, currentStatus?: string) => {
  if (currentStatus !== "baja") {
    await set(ref(database, `usuarios/${userId}/estadoUsuario`), "bloqueado");
    setStatus("bloqueado");
  } else {
    alert("No se puede bloquear un usuario que ya está dado de baja");
  }
};

export const handleUnblock = async (
  userId: string,
  currentStatus: string,
  setStatus: (v: string) => void,
  setAttempt: (v: number) => void,
  setTime: (v: string) => void
) => {
  if (currentStatus !== "baja") {
    await set(ref(database, `usuarios/${userId}/estadoUsuario`), "normal");
    setStatus("normal");

    await set(ref(database, `usuarios/${userId}/intentos/total`), 0);
    setAttempt(0);

    await set(ref(database, `usuarios/${userId}/intentos/ultimo`), 0);
    setTime("-");
  } else {
    alert("No se puede desbloquear un usuario que ya está dado de baja");
  }
};
