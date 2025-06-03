"use client";
//Firebase
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { getDatabase, ref, get } from "firebase/database";
import { useEffect } from "react";

import { incrementLoginAttempt, resetAttempts } from "../api/attempts/attempts";
import { estilosClasificacion } from "./alertaEstilos";
import { Alerta } from "./alertaPantalla";
import { CampoContrasena } from "./campoContrasena";
import { initializeUserHistory } from "../api/history/history";

interface Usuario {
  email: string;
}

export default function Formulario() {

  try {

   useEffect(() => {
      async function deleteCookie() {
        await fetch("/api/deleteCookie?name=candidateId", {
          method: "DELETE",
        }).then((resp) => {
          console.log(resp);
        });
      }
      deleteCookie();
    }, []);

  }

  catch {

    console.log("No se detecto un usario loggeado.");

  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  type clasifAlerta = "aprobado" | "denegado" | "errorSist" | "info";

  /*Andy (04.04 9:28) Para las alertas durante el login*/
  const [alertaAcceso, setAlertaAcceso] = useState<{
    type: clasifAlerta;
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
      // PRIMERO: Verificar el estado del usuario en la base de datos ANTES del login
      const db = getDatabase();
      const usuariosRef = ref(db, `usuarios`);
      const snapshot = await get(usuariosRef);
      
      let userData = null;
     // let userUID = null;
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Buscar el usuario por email
        const userEntry = Object.entries(data).find(
          ([uid, usuario]) => (usuario as Usuario).email === email
        );
        
        if (userEntry) {
          //userUID = userEntry[0];
          userData = userEntry[1] as any;
        }
      }
      
      // Si no existe el usuario
      if (!userData) {
        setAlertaAcceso({
          type: "denegado",
          mensaje: "El usuario o la contraseña son incorrectos.",
        });
        return;
      }
      
      // Verificar el estado del usuario ANTES de hacer login
      const estado = userData.estadoUsuario;
      
      switch (estado) {
        case "bloqueado":
          setAlertaAcceso({
            type: "denegado",
            mensaje: "Su cuenta fue bloqueada por múltiples intentos fallidos de inicio de sesión. Recupere su contraseña.",
          });
          return; // Salir sin intentar login
          
        case "inhabilitada":
          setAlertaAcceso({
            type: "denegado",
            mensaje: "Su cuenta fue inhabilitada de forma temporal. Contacte al administrador.",
          });
          return;
          
        case "baja":
          setAlertaAcceso({
            type: "denegado",
            mensaje: "Su cuenta fue inhabilitada de forma permanente.",
          });
          return;
          
        case "enProceso":
        case "cambioContrasena":
          setAlertaAcceso({
            type: "info",
            mensaje: "Su cuenta está en proceso de recuperación. Le llegará una notificación cuando esté lista.",
          });
          return;
      }
      
      // AHORA SÍ: Intentar el login con Firebase Auth
      const userCredentials = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredentials.user.uid;
      console.log("Logged in as:", userCredentials.user);

      // Inicializa el historial del usuario
      await initializeUserHistory(uid);

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

      // Verificar estado después del login exitoso
      if (estado === "previo") {
        console.log("Establezca su contraseña por primera vez");
        router.push("/olvidaste/reestablecer");
        return;
      }

      if (estado === "normal") {
        // Usuario activo: login permitido
        await resetAttempts(email);
        router.push("/auth/redirector");
      } else {
        setAlertaAcceso({
          type: "errorSist",
          mensaje: "Su cuenta tiene un estado desconocido. Contacte al administrador.",
        });
      }

    } catch (err: unknown) {
      console.error("Error during login:", err);
      
      // Manejar errores de contraseña incorrecta
      const db = getDatabase();
      const usuariosRef = ref(db, `usuarios`);
      const snapshot = await get(usuariosRef);

      let correoExiste = false;

      if (snapshot.exists()) {
        const data = snapshot.val();
        correoExiste = Object.values(data).some(
          (usuario) => (usuario as Usuario).email === email
        );
      }

      let msg = "El usuario o la contraseña son incorrectos.";

      if (correoExiste) {
        console.log("El correo existe, incrementando intentos...");
        const remainingAttempts = await incrementLoginAttempt(email);
        console.log("Intentos restantes:", remainingAttempts);
        
        if (remainingAttempts > 0 && remainingAttempts <= 3) {
          msg += ` Queda${remainingAttempts !== 1 ? "n " : " "} ${remainingAttempts} intento${remainingAttempts !== 1 ? "s" : ""} antes de que la cuenta sea bloqueada.`;
        }
      }

      setAlertaAcceso({
        type: "denegado",
        mensaje: msg,
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
                ? estilosClasificacion[alertaAcceso.type].input 
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
          className= {alertaAcceso ? estilosClasificacion[alertaAcceso.type].input : ""}
        />
        <div>
          <button
            type="submit"
            className="cursor-pointer w-full bg-[#2d4583] text-white py-2 rounded-lg hover:bg-[#08b177] transition"
          >
            Iniciar Sesión
          </button>
        </div>
        <div className="mb-4 text-center py-4 pt-6">
          <a href="/olvidaste" className="text-[#2975a0] hover:text-[#08b177]">
            Recuperar mi contraseña
          </a>
        </div>
      </form>
    </>
  );
}