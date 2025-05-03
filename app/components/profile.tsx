"use client";
import React, { useEffect, useState } from "react";
//import { useRouter } from "next/navigation";
import ProfilePicture from "@/app/components/profile-picture";
//import {deleteCookie} from '@/app/components/deleteCookie'

export default function Profile() {
  const [name, setname] = useState("");
  const [lastname, setlastname] = useState("");
  const [mail, setmail] = useState("");
  const [role, setrole] = useState("");

  //const router = useRouter();
  useEffect(() => {
    const getUserData = async () => {
      await fetch("/api/getCurrentUser").then(async (res) => {
        const jason = await res.json();
        console.log("UID: ", jason.apellidos);

        setname(jason.nombre);
        setlastname(jason.apellidos);
        setmail(jason.email);
        setrole(jason.rol);
      });

      //const dbref = database;
      //const usuariosref = ref(dbref, "/usuarios/");
      // const usuarios = await get(usuariosref);
      //console.log(usuarios.val());
    };
    getUserData();
  }, []);

  {/* 
  const onLogout = async () => {
    await fetch("/api/deleteCookie?name=candidateId", {
      method: "DELETE",
    }).then((resp) => {
      console.log(resp);
      router.push("/auth/redirector");
    });
  };
  */}

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Perfil de Usuario
        </h2>
        <div className="flex justify-center mb-6">
          <ProfilePicture
            nombre={name}
            width={"w-15"}
            height={"h-15"}
            textSize={"text-3xl"}
          />
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-gray-600 text-sm">Nombre</label>
            <p className="text-lg font-medium">{name}</p>
          </div>
          <div>
            <label className="text-gray-600 text-sm">Apellidos</label>
            <p className="text-lg font-medium">{lastname}</p>
          </div>
          <div>
            <label className="text-gray-600 text-sm">Correo</label>
            <p className="text-lg font-medium">{mail}</p>
          </div>
          <div>
            <label className="text-gray-600 text-sm">Rol</label>
            <p className="text-lg font-medium">{role}</p>
          </div>
        </div>

        <button
          //onClick={onLogout}
          disabled={true}
          className="mt-8 w-full bg-gray-300 text-white font-semibold py-2 px-4 rounded-xl transition duration-200"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
