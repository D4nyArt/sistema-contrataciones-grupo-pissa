import { getDatabase, ref, query, orderByChild, equalTo, get, runTransaction, set, update } from "firebase/database";

const MAX_ATTEMPTS = 3;

export async function incrementLoginAttempt(email: string): Promise<number> {
  try {
    const db = getDatabase();
    const userQuery = query(ref(db, "usuarios"), orderByChild("email"), equalTo(email));
    const snapshot = await get(userQuery);

    if (!snapshot.exists()) return MAX_ATTEMPTS;

    const uid = Object.keys(snapshot.val())[0];
    const totalRef = ref(db, `usuarios/${uid}/intentos/total`);
    const lastRef = ref(db, `usuarios/${uid}/intentos/ultimo`);

    await runTransaction(totalRef, (currentTotal) => (currentTotal || 0) + 1);

    const now = new Date().toISOString();
    await set(lastRef, now);

    await checkAndBlockUser(uid);

    const finalSnap = await get(totalRef);
    const totalFinal = finalSnap.val() || 0;
    return MAX_ATTEMPTS - totalFinal;
  } catch (_) {
    return MAX_ATTEMPTS;
  }
}

async function checkAndBlockUser(uid: string) {
  try {
    const db = getDatabase();
    const userRef = ref(db, `usuarios/${uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      const userData = snapshot.val();
      const total = userData.intentos?.total;
      const status = userData.estadoUsuario;

      if (total >= MAX_ATTEMPTS && status !== "bloqueado") {
        await update(userRef, { estadoUsuario: "bloqueado" });
      }
    }
  } catch (_) {
    // Silent failure
  }
}

export async function resetAttempts(email: string) {
  try {
    const db = getDatabase();
    const userQuery = query(ref(db, "usuarios"), orderByChild("email"), equalTo(email));
    const snapshot = await get(userQuery);

    if (!snapshot.exists()) return;

    const uid = Object.keys(snapshot.val())[0];
    const totalRef = ref(db, `usuarios/${uid}/intentos/total`);
    const lastRef = ref(db, `usuarios/${uid}/intentos/ultimo`);

    await set(totalRef, 0);
    await set(lastRef, "-");
  } catch (_) {
    // Silent failure
  }
}
