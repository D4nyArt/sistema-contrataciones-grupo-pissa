"use client";
import React, { useEffect, useState } from "react";
import ProfilePicture from "@/app/components/profile-picture";
import { Alerta } from "./alertaPantalla";

export default function Profile() {
  const [name, setname] = useState("");
  const [lastname, setlastname] = useState("");
  const [mail, setmail] = useState("");
  const [role, setrole] = useState("");
  const [tel, setTel] = useState("");
  const [edit, setEdit] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");
  const [loading, setLoading] = useState(true);


  type clasifAlerta = "aprobado" | "denegado" | "errorSist" | "info";
  const [alerta, setAlerta] = useState<{
    type: clasifAlerta;
    mensaje: string;
  } | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await fetch("/api/getCurrentUser");
        const jason = await res.json();
        
        setOriginalEmail(jason.email);
        setname(jason.nombre);
        setlastname(jason.apellidos);
        setmail(jason.email);
        setrole(jason.rol);
        setTel(jason.telefono);
      } catch (error) {
        setAlerta({
          type: "errorSist",
          mensaje: "Error al obtener los datos del usuario",
        });
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  const changeProfile = async () => {
    if (loading) return;
    if (edit) {
      const res = await fetch("/api/updateUser", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetEmail: originalEmail,
          email: mail,
          telefono: tel,
        }),
      });

      if (res.ok) {
        document.cookie = "candidateId=; path=/; max-age=0";
        
        setAlerta({
          type: "info",
          mensaje: "Perfil actualizado correctamente",
        });
        setEdit(false);
      } else {
        setAlerta({
          type: "errorSist",
          mensaje: "Error al actualizar los datos",
        });
      }
    } else {
      setEdit(true);
    }
  };

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
            <label className="text-gray-600 text-sm">Rol</label>
            <p className="text-lg font-medium">{role}</p>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Correo</label>
            {edit ? (
              <input
                type="email"
                className="w-full mt-1 p-2 border rounded"
                value={mail}
                onChange={(e) => setmail(e.target.value)}
              />
            ) : (
              <p className="text-lg font-medium">{mail}</p>
            )}
          </div>

          <div>
            <label className="text-gray-600 text-sm">Teléfono</label>
            {edit ? (
              <input
                type="tel"
                className="w-full mt-1 p-2 border rounded"
                value={tel}
                onChange={(e) => setTel(e.target.value)}
              />
            ) : (
              <p className="text-lg font-medium">{tel}</p>
            )}
          </div>
        </div>

        <button
          onClick={changeProfile}
          disabled={loading}
          className={`mt-8 w-full ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-emerald-500 hover:bg-emerald-700"
          } text-white py-2 rounded-lg transition-colors duration-200`}
        >
          {edit ? "Guardar cambios" : "Editar perfil"}
        </button>
      </div>
    </div>
  );
}
