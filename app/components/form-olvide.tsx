/*Pendientes de este código:
    
    1) Lógica de Firebase para validar el estado del usuario
    2) Cambio de contraseña a partir de Firebase
    3) Estándar para contraseñas válidas

*/

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";

import { Alerta } from "./alertaPantalla";
import { CampoContrasena } from "./campoContrasena";

export default function FormularioOlvide() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [alertaRecuperar, setAlertaRecuperar] = useState<{
    type: "aprobado" | "denegado" | "errorSist" | "info";
    mensaje: string;
  } | null>(null);
  const router = useRouter();

  const cambioEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value); // Cuando hay  un cambio en el input de correo...
    if (alertaRecuperar) {
      // si la alerta de acceso tiene algún valor, por ejemplo 'denegado'...
      setAlertaRecuperar(null);
    } // ejecuta la función con valor de null (desaparece la alerta)
  };

  const cambioContrasena = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (alertaRecuperar) {
      setAlertaRecuperar(null);
    }
  };

  const cambioNuevaContrasena = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (alertaRecuperar) {
      setAlertaRecuperar(null);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== newPassword) {
      setAlertaRecuperar({
        type: "denegado",
        mensaje: "Las contraseñas no coinciden",
      });
    } else {
      try {
        const userCredentials = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const uid = userCredentials.user.uid;

        /*Andy (09.04.2025) Pendiente de preguntarle a Esteban cómo se verifica
          en firebase el estado del usuario. Mientras solo voy a 
          declarar una constante*/
        const estadoUsuario = "bloqueado";

        if (estadoUsuario === "bloqueado") {
          document.cookie = `candidateId=${uid}; path=/; secure; samesite=strict; max-age=86400`; // Expira en 1 día

          setAlertaRecuperar({
            type: "aprobado",
            mensaje:
              "La solicitud se realizó exitosamente. Por favor, espere la aprobación del proceso.",
          });
        } else {
          setAlertaRecuperar({
            type: "info",
            mensaje:
              "Tiene una solicitud en curso. Por favor, espere la aprobación del proceso",
          });
        }
      } catch (error) {
        setAlertaRecuperar({
          type: "errorSist",
          mensaje:
            "El correo electrónico no existe en la base de datos. Verifique la información.",
        });
      }
    }
  };

  return (
    <>
      <form onSubmit={handleLogin}>
        {alertaRecuperar && (
          <Alerta
            tipo={alertaRecuperar.type}
            mensaje={alertaRecuperar.mensaje}
            funCerrar={() => setAlertaRecuperar(null)}
          />
        )}

        <div className="mb-4">
          <input
            type="email"
            className={`w-full p-2 border rounded-lg mt-1 bg-[#fafbfc] ${
              alertaRecuperar
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
          placeholder="Nueva Contraseña"
          value={password}
          onChange={cambioContrasena}
          error={!!alertaRecuperar}
        />

        <CampoContrasena
          placeholder="Confirmar Contraseña"
          value={newPassword}
          onChange={cambioNuevaContrasena}
          error={!!alertaRecuperar}
        />
        <div>
          <button
            type="submit"
            className="w-full bg-[#2d4583] text-white py-2 rounded-lg hover:bg-[#08b177] transition"
          >
            Enviar solicitud
          </button>
        </div>
        <div className="pt-6 flex items-center justify-center">
          <a
            href="/"
            className="items-center flex hover:text-[#08b177] text-[#2975a0] group"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-arrow-left transition-all group-hover:scale-x-125"
            >
              <path d="M6 8L2 12L6 16" />
              <path d="M2 12H22" />
            </svg>
            <span className="pl-2">Regresar</span>
          </a>
        </div>
      </form>
    </>
  );
}
