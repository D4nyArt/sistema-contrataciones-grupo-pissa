"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { database } from "../../firebaseConfig";
import { ref, get, set } from "firebase/database";
import ProfilePicture from "./profile-picture";
import {
  CircleCheck,
  CircleUser,
  Clock,
  Lock,
  LockOpen,
  Mail,
  Phone,
  UserMinus,
} from "lucide-react";
import { urbanist } from "./fonts";

/*
interface User {
  id: string;
  nombre?: string;
  apellidos?: string;
  rol?: string;
  email?: string;
  telefono?: string;
}*/

export default function Usuarios() {
  // const router = useRouter();
  const pathname = usePathname();
  // const searchparams = useSearchParams();
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [mail, setMail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const id = pathname.split("/")[2];

  const handleRemoval = async () => {
    await set(
      ref(database, `usuarios/${id}/estadoUsuario`),
      "dado de baja"
    ).then(() => {
      setStatus("dado de baja");
    });
  };

  const handleBlock = async () => {
    if (status != "dado de baja") {
      await set(
        ref(database, `usuarios/${id}/estadoUsuario`),
        "bloqueado"
      ).then(() => {
        setStatus("bloqueado");
      });
    } else {
      alert("No se puede bloquear un usuario que ya esta dado de baja");
    }
  };

  const handleUnblock = async () => {
    if (status != "dado de baja") {
      await set(ref(database, `usuarios/${id}/estadoUsuario`), "normal").then(
        () => {
          setStatus("normal");
        }
      );
    } else {
      alert("No se puede desbloquear un usuario que ya esta dado de baja");
    }
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
                  <div className="flex flex-row items-center px-2 py-0.5 bg-green-100 rounded">
                    <CircleCheck className="size-4 text-green-800" />
                    <p className="pl-1 text-green-800 capitalize text-xs">
                      Activo
                    </p>
                  </div>
                )}
                {status === "bloqueado" && (
                  <div className="flex flex-row items-center px-2 py-0.5 bg-red-100 rounded">
                    <Lock className="size-4 text-red-800" />
                    <p className="pl-1 text-red-800 capitalize text-xs">
                      Bloqueado
                    </p>
                  </div>
                )}
                {status === "dado de baja" && (
                  <div className="flex flex-row items-center px-2 py-0.5 bg-red-100 rounded">
                    <Lock className="size-4 text-red-800" />
                    <p className="pl-1 text-red-800 capitalize text-xs">
                      Dado de Baja
                    </p>
                  </div>
                )}
                {status === "enProceso" && (
                  <div className="flex flex-row items-center px-2 py-0.5 bg-gray-200 rounded">
                    <Clock className="size-4 text-gray-800" />
                    <p className="pl-1 text-gray-800 capitalize text-xs">
                      En proceso
                    </p>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[#2975a0]">{role}</p>
          </div>
        </span>
        <div className="md:ml-auto">
          <button
            className="border-2 border-gray-400 text-[#212529] py-2 px-4 rounded-lg mr-2 inline-flex"
            onClick={handleUnblock}
          >
            <LockOpen className="pr-2" /> Desbloquear
          </button>
          <button
            className="border-2 border-gray-400 text-[#212529] py-2 px-4 rounded-lg mr-2 inline-flex"
            onClick={handleBlock}
          >
            <Lock className="pr-2" /> Bloquear
          </button>
          <button
            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition inline-flex"
            onClick={handleRemoval}
          >
            <UserMinus className="pr-2" /> Dar de baja
          </button>
        </div>
      </div>
      <div className="pb-6 pt-2 {/*border-b border-gray-300*/} text-sm">
        <table className="table-auto text-[#495057]">
          <tbody>
            <tr>
              <td className="inline-flex pr-8">
                <CircleUser className="pr-2" />
                ID del Usuario
              </td>
              <td>{id}</td>
            </tr>
            <tr>
              <td className="inline-flex">
                <Mail className="pr-2" /> Correo
              </td>
              <td>{mail}</td>
            </tr>
            <tr>
              <td className="inline-flex">
                <Phone className="pr-2" /> Teléfono
              </td>
              <td>{phone}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
