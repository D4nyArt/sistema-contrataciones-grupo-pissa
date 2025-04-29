"use client";
//Firebase
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { getDatabase, ref, get } from "firebase/database";

// Componentes propios
import { Alerta } from "./alertaPantalla";
import { CampoContrasena } from "./campoContrasena";

export default function Formulario() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  /*Andy (04.04 9:28) Para las alertas durante el login*/
  const [alertaAcceso, setAlertaAcceso] = useState<{
    type: "denegado";
    mensaje: string;
  } | null>(null);
  const router = useRouter();
  /*Andy (04.04 9:54) Esto es para que la alerta de error desaparezca solo cuando el usuario
  ha cambiado por lo menos un valor en el campo del email o contraseña*/
  const cambioEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value); // Cuando hay  un cambio en el input de correo...
    if (alertaAcceso) {
      // si la alerta de acceso tiene algún valor, por ejemplo 'denegado'...
      setAlertaAcceso(null);
    } // reestablece el valor a null (desaparece la alerta)
  };

  const cambioContrasena = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (alertaAcceso) {
      setAlertaAcceso(null);
    }
  };
  /********************************************************************/

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredentials.user.uid;
      console.log("Logged in as:", userCredentials.user);

      const response = await fetch("/api/saveUIDCookie", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid }),
      });

      if (!response.ok) {
        throw new Error("Error guardando la cookie");
      }

      if (response.ok) {
        console.log("El uid se ha guardado en una cookie :)");
      }

      /**********************************
       * Si el inicio salió bien, enntonces verifica que si el usuario
       * es nuevo para que cambie su contraseña
       */
      const db = getDatabase();
      const userRef = ref(db, `usuarios/${uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        console.log("Datos del usuario:", userData);

 // Lógica de los estados de usuario
 if (userData.estadoUsuario === "previo") {
  console.log("Establezca su contraseña por primera vez");
  router.push("/olvidaste/reestablecer");
} else if (userData.estadoUsuario === "bloqueado") {
  // Usuario bloqueado: intentos de inicio de sesión fallidos
  setAlertaAcceso({
    type: "denegado",
    mensaje: "Su cuenta fue bloqueada debido a numerosos intentos consecutivos de inicio de sesión. Reestablezca su contraseña.",
  });
} else if (userData.estadoUsuario === "baja") {
  // Baja: La cuenta fue inhabilitada permanentemente
  setAlertaAcceso({
    type: "denegado",
    mensaje: "Su cuenta está inhabilitada de forma permanente.",
  });
} else {
  router.push("/auth/redirector");
}
} else {
console.error("No se encontraron datos del usuario en la base de datos");
router.push("/auth/redirector"); // Redirigimos al flujo normal por defecto
}
} catch (err: any) {
console.error("Error during login:", err);
setAlertaAcceso({
type: "denegado",
mensaje: "El usuario o la contraseña son incorrectos",
});
}
};

return (
<>
<form onSubmit={handleLogin}>
{alertaAcceso && (
  <Alerta
    tipo={alertaAcceso.type}
    mensaje={alertaAcceso.mensaje}
    funCerrar={() => setAlertaAcceso(null)}
  />
)}

<div className="mb-4">
  <input
    type="email"
    className={`w-full p-2 border rounded-lg mt-1 bg-[#fafbfc] ${
      alertaAcceso
        ? "border-red-400 text-red-600 placeholder-red-400"
        : "border-gray-300 text-black"
    }`}
    placeholder="Correo electrónico"
    value={email}
    onChange={cambioEmail}
    required
  />
</div>

<CampoContrasena
  value={password}
  onChange={cambioContrasena}
  error={!!alertaAcceso}
/>
<div>
  <button
    type="submit"
    className="w-full bg-[#2d4583] text-white py-2 rounded-lg hover:bg-[#08b177] transition"
  >
    Iniciar Sesión
  </button>
</div>
<div className="mb-4 text-center py-4 pt-6">
  <a href="/olvidaste" className="text-[#2975a0] hover:text-[#08b177]">
    ¿Olvidaste tu contraseña?
  </a>
</div>
</form>
</>
);
}