"use client";
import React, { useEffect, useState } from "react";
import ProfilePicture from "@/app/components/profile-picture";
import { Alerta } from "./alertaPantalla";
import { addHistoryEntry } from '../api/history/history';
import { getAuth } from "firebase/auth";


export default function Profile() {
  const [name, setname] = useState("");
  const [lastname, setlastname] = useState("");
  const [mail, setmail] = useState("");
  const [role, setrole] = useState("");
  const [tel, setTel] = useState("");
  const [emailSecundario, setEmailSecundario] = useState("");
  const [sexo, setSexo] = useState("");
  const [puesto, setPuesto] = useState("");
  const [area, setArea] = useState("");
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
        setTel(jason.telefono || "");
        setEmailSecundario(jason.emailSecundario || "");
        setSexo(jason.sexo);
        setPuesto(jason.puesto);
        setArea(jason.area);
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
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
      try {
        // Preparar el body de la petición
        const updateData: {
          targetEmail: string;
          telefono?: string;
          emailSecundario?: string | null;
          sexo?: string;
        } = {
          targetEmail: originalEmail,
        };

        // Solo incluir teléfono si tiene valor o si se está limpiando
        if (tel !== undefined) {
          updateData.telefono = tel;
        }

        // Incluir email secundario (puede ser vacío o null)
        updateData.emailSecundario = emailSecundario || null;
        updateData.sexo = sexo;

        const res = await fetch("/api/updateUser", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        const responseData = await res.json();
        const auth = getAuth();
        const uid = auth.currentUser!.uid;


        if (res.ok) {
          await addHistoryEntry(uid, "documentos", new Date().toISOString(), undefined, "Actualización de la información de contacto");
          setAlerta({
            type: "aprobado",
            mensaje: "Perfil actualizado correctamente",
          });
          setEdit(false);
        } else {
          setAlerta({
            type: "errorSist",
            mensaje: responseData.message || "Error al actualizar los datos",
          });
        }
      } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        setAlerta({
          type: "errorSist",
          mensaje: "Error de conexión al actualizar los datos",
        });
      }
    } else {
      setEdit(true);
    }
  };

  return (
    <div className="p-4">
      {/* Alerta en la parte superior */}
      {alerta && (
        <div className="mb-4 flex justify-center">
          <Alerta
            tipo={alerta.type}
            mensaje={alerta.mensaje}
          />
        </div>
      )}
      
      {/* Contenedor principal centrado */}
      <div className="items-start justify-start">
      <h1 className={"text-4xl text-[#212529] pl-4 font-bold mb-4 animate-fade-in-up"}>Perfil de Usuario</h1>
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
          <div className="flex space-x-5 md:space-x-10 items-center mb-7">
            <ProfilePicture
              nombre={name}
              width={"w-10 md:w-20"}
              height={"h-10 md:h-20"}
              textSize={"text-3xl"}
            />
            <div>
              <label className="text-gray-600 text-sm">Nombre</label>
              <p className="text-lg font-medium">{name}</p>
            </div>

            <div>
              <label className="text-gray-600 text-sm">Apellidos</label>
              <p className="text-lg font-medium">{lastname}</p>
            </div>

            <div className="ml-30 hidden md:block">
              <label className="text-gray-600 text-sm">Rol</label>
              <p className="text-lg font-medium">{role}</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xl font-semibold text-[#212529]">Mi información</p>
            <div className="flex flex-col justify-center md:grid md:grid-cols-2 gap-6">

            <div>
              <label className="text-gray-600 text-sm">Área</label>
              <p className="text-lg font-medium">{area}</p>
            </div>

            <div>
              <label className="text-gray-600 text-sm">Puesto</label>
              <p className="text-lg font-medium">{puesto}</p>
            </div>

            <div>
              <label className="text-gray-600 text-sm">Correo Corporativo</label>
              <p className="text-lg font-medium">{mail}</p>
            </div>

            {/* Email Secundario - Always visible */}
            <div>
              <label className="text-gray-600 text-sm">Correo Personal</label>
              {edit ? (
                <input
                  type="email"
                  className="w-full mt-1 p-2 border rounded"
                  value={emailSecundario}
                  onChange={(e) => setEmailSecundario(e.target.value)}
                  placeholder="email.secundario@ejemplo.com"
                />
              ) : (
                <p className="text-lg font-medium">{emailSecundario || "No configurado"}</p>
              )}
            </div>

            <div>
              <label className="text-gray-600 text-sm">Sexo</label>
              {edit ? (
                <select
                  className="w-full mt-1 p-2 border rounded"
                  value={sexo}
                  onChange={(event) => setSexo(event.target.value)}
                >
                  <option value="" disabled></option>
                  <option value="Hombre">Hombre</option>
                  <option value="Mujer">Mujer</option>
                  <option value="Otro">Otro</option>
                </select>
              ) : (
                <p className="text-lg font-medium">{sexo}</p>
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
                  placeholder="Número de teléfono"
                />
              ) : (
                <p className="text-lg font-medium">{tel || "No configurado"}</p>
              )}
            </div>
            </div>
          </div>

          <button
            onClick={changeProfile}
            disabled={loading}
            className={`cursor-pointer mt-8 w-full ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-emerald-500 hover:bg-emerald-700"
            } text-white py-2 rounded-lg transition-colors duration-200`}
          >
            {edit ? "Guardar cambios" : "Editar perfil"}
          </button>
        </div>
      </div>
    </div>
  );
}