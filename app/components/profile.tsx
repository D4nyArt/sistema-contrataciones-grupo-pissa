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
  const [emailSecundario, setEmailSecundario] = useState("");
  const [showSecondaryEmail, setShowSecondaryEmail] = useState(false);
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
        
        // Si ya existe un email secundario, mostrarlo
        if (jason.emailSecundario) {
          setEmailSecundario(jason.emailSecundario);
          setShowSecondaryEmail(true);
        }
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
        } = {
          targetEmail: originalEmail,
        };

        // Solo incluir teléfono si tiene valor o si se está limpiando
        if (tel !== undefined) {
          updateData.telefono = tel;
        }

        // Manejar email secundario
        if (showSecondaryEmail) {
          updateData.emailSecundario = emailSecundario || null;
        } else {
          // Si se oculta el campo, eliminar el email secundario
          updateData.emailSecundario = null;
        }

        const res = await fetch("/api/updateUser", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });

        const responseData = await res.json();

        if (res.ok) {
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

  const toggleSecondaryEmail = () => {
    if (!edit) return;
    
    if (showSecondaryEmail) {
      // Si se oculta, limpiar el campo
      setEmailSecundario("");
      setShowSecondaryEmail(false);
    } else {
      setShowSecondaryEmail(true);
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
      <div className="flex items-center justify-center">
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
              <div className="flex items-center justify-between">
                <label className="text-gray-600 text-sm">Correo Principal</label>
                {edit && (
                  <button
                    type="button"
                    onClick={toggleSecondaryEmail}
                    className="text-emerald-500 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
                    title={showSecondaryEmail ? "Quitar email secundario" : "Agregar email secundario"}
                  >
                    {showSecondaryEmail ? (
                      <>
                        <span className="text-lg">−</span>
                        Email secundario
                      </>
                    ) : (
                      <>
                        <span className="text-lg">+</span>
                        Email secundario
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="text-lg font-medium">{mail}</p>
            </div>

            {/* Email Secundario */}
            {showSecondaryEmail && (
              <div>
                <label className="text-gray-600 text-sm">Email Secundario</label>
                {edit ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      className="flex-1 mt-1 p-2 border rounded"
                      value={emailSecundario}
                      onChange={(e) => setEmailSecundario(e.target.value)}
                      placeholder="email.secundario@ejemplo.com"
                    />
                  </div>
                ) : (
                  <p className="text-lg font-medium">{emailSecundario || "No configurado"}</p>
                )}
              </div>
            )}

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
    </div>
  );
}