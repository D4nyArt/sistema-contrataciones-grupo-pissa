"use client";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { usePathname } from "next/navigation";
import { database } from "../../firebaseConfig";
import { ref, get, set } from "firebase/database";
import ProfilePicture from "./profile-picture";

import { handleBlock, handleUnblock } from "./block";

import RealizarSeguimiento from "./relizarseguimiento";
import CancelarSeguimiento from "./cancelarseguimiento";
import {
  CircleCheck,
  Clock,
  Lock,
  LockOpen,
  Undo,
  UserMinus,
} from "lucide-react";
import { urbanist } from "./fonts";
import BotonRegresar from "./botonRegresar";
import SeguimientoToggle from "./seguimiento";

export default function Usuarios() {
  const [rhUID, setRhUID] = useState<string | null>(null);
  // const router = useRouter();
  const pathname = usePathname();
  // const searchparams = useSearchParams();
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [mail, setMail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [time, setTime] = useState("-");
  const id = pathname.split("/")[2];

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, (user) => {
      setRhUID(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  const handleRemoval = async () => {
    await set(
      ref(database, `usuarios/${id}/estadoUsuario`),
      "baja"
    ).then(() => {
      setStatus("baja");
    });
  };
  useEffect(() => {
    //get(ref(database, `usuarios/${id}`))

    const fetchUser = async () => {
      try {
        const userRef = ref(database, `usuarios/${id}`);
        const snapshot = await get(userRef);
        const data = snapshot.val() || {};
        setName(data.nombre || "");
        setLastname(data.apellidos || "");
        setMail(data.email || "");
        setPhone(data.telefono || "");
        setRole(data.rol || "");
        setStatus(data.estadoUsuario || "");
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, [id]);

  return (
    <div>
      <div className="mb-8">
        <BotonRegresar />
      </div>
      <div className="flex flex-col md:flex-row items-center {/*border-b border-gray-300*/} pb-6">
        <ProfilePicture
          nombre={`${name}`}
          width={"w-15"}
          height={"h-15"}
          textSize={"text-3xl"}
        />
        <span className="pl-4">
          <div>
            <div className="flex flex-row items-center">
              <strong
                className={`${urbanist.className} text-2xl text-[#212529]`}
              >
                {name} {lastname}
              </strong>
              <div className="flex flex-row pl-2 items-center">
                {status === "normal" && (
                  <div className="flex flex-row items-center px-2 py-0.5 bg-green-100 rounded-lg">
                    <CircleCheck className="size-4 text-green-800" />
                    <p className="pl-1 text-green-800 normal-case text-xs">
                      Normal
                    </p>
                  </div>
                )}
                {status === "bloqueado" && (
                  <div className="flex flex-row items-center px-2 py-0.5 bg-red-100 rounded-lg">
                    <Lock className="size-4 text-red-800" />
                    <p className="pl-1 text-red-800 normal-case text-xs">
                      Bloqueado
                    </p>
                  </div>
                )}
                {status === "baja" && (
                  <div className="flex flex-row items-center px-2 py-0.5 bg-red-100 rounded-lg">
                    <UserMinus className="size-4 text-red-800" />
                    <p className="pl-1 text-red-800 normal-case text-xs">
                      Dado De Baja
                    </p>
                  </div>
                )}
                {status === "enProceso" && (
                  <div className="flex flex-row items-center px-2 py-0.5 bg-gray-200 rounded-lg">
                    <Clock className="size-4 text-gray-800" />
                    <p className="pl-1 text-gray-800 normal-case text-xs">
                      En proceso
                    </p>
                  </div>
                )}
                {status === "previo" && (
                  <div className="flex flex-row items-center px-2 py-0.5 bg-gray-200 rounded-lg">
                    <Undo className="size-4 text-gray-800" />
                    <p className="pl-1 text-gray-800 normal-case text-xs">
                      Previo
                    </p>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[#2975a0] capitalize">{role}</p>
          </div>
        </span>
        <div className="md:ml-auto flex">
          {role === "candidato" && (
            <SeguimientoToggle rhUID={rhUID!} candidateUID={id}/>
          )}
            {status !== "dado de baja" && (
              <button
                className={`justify-center border-2 py-2 px-4 rounded-lg mr-2 inline-flex transition-all duration-300 cursor-pointer ${
                  status === "bloqueado"
                    ? "border-gray-500 text-[#212529] hover:border-green-500 hover:text-green-700 hover:bg-green-100 w-40"
                    : "border-gray-500 text-[#212529] hover:border-red-500 hover:text-red-700 hover:bg-red-100 w-40"
                }`}
                onClick={() =>
                  status === "bloqueado"
                    ? handleUnblock(id, status, setStatus, setAttempt, setTime)
                    : handleBlock(id, setStatus, status)
                }
              >
                {status === "bloqueado" ? (
                  <>
                    <LockOpen className="pr-2" /> Desbloquear
                  </>
                ) : (
                  <>
                    <Lock className="pr-2" /> Bloquear
                  </>
                )}
              </button>
            )}

          <button
            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition inline-flex cursor-pointer"
            onClick={handleRemoval}
          >
            <UserMinus className="pr-2" /> Dar de baja
          </button>
        </div>
      </div>
    </div>
  );
}
