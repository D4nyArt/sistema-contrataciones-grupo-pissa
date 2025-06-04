import { ref, set } from "firebase/database";
import { database } from "../../firebaseConfig";

export const handleBlock = async (userId: string, setStatus: (v: string) => void, role: string, currentStatus?: string) => {
  
  const res = await fetch("/api/getCurrentUser");
  const jason = await res.json();
  const isAdmin = jason.rol === "admin";

  if (role === "admin") {
    alert("No se puede bloquear al ADMIN");
    return;
  }

  if (!isAdmin && role === "rh") {
    alert("Solo el ADMIN puede bloquear usuarios de rh");
    return;
  }

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

export const handleRemoval = async (
  id: string,
  setStatus: (v: string) => void,
  role: string
) => {

  const res = await fetch("/api/getCurrentUser");
  const jason = await res.json();
  const isAdmin = jason.rol === "admin";

  if (role === "admin") {
    alert("No se puede dar de baja al ADMIN");
    return;
  }

  if (!isAdmin && role === "rh") {
    alert("Solo el ADMIN puede dar de baja a usuarios de RH");
    return;
  }

    await set(
      ref(database, `usuarios/${id}/estadoUsuario`),
      "baja"
    ).then(() => {
      setStatus("baja");
    });
  };
