/**
 * profile.tsx
 *
 * Proporciona una interfaz completa de visualización y edición del perfil de usuario.
 *
 * Este componente permite a los usuarios ver su información personal y laboral completa,
 * con capacidad de editar campos específicos como teléfono y correo personal. Incluye
 * carga automática de datos desde la API, validación de cambios, guardado asíncrono
 * y feedback visual mediante alertas. Presenta la información de forma organizada
 * con avatar personalizado y diseño responsivo.
 */

"use client";
import React, { useEffect, useState } from "react";
import ProfilePicture from "@/app/components/profile-picture";
import { Alerta } from "./alertaPantalla";

/**
 * Renderiza una interfaz completa de perfil de usuario con funcionalidad de edición.
 *
 * Este componente proporciona una vista detallada del perfil del usuario actual,
 * mostrando información personal y laboral obtenida automáticamente desde la API.
 * Permite la edición de campos específicos (teléfono y correo personal) mediante
 * un modo de edición que se activa/desactiva con un botón. Incluye validación,
 * guardado asíncrono de cambios y sistema de alertas para feedback al usuario.
 * La interfaz presenta un avatar personalizado, información organizada en secciones
 * y diseño responsivo para una experiencia de usuario óptima.
 *
 * @returns El elemento JSX que renderiza la interfaz completa del perfil de usuario.
 *
 * @example
 * ```tsx
 * // Uso en página de perfil de usuario
 * <div className="profile-page">
 *   <Profile />
 * </div>
 *
 * // El componente automáticamente:
 * // 1. Carga datos del usuario actual desde /api/getCurrentUser
 * // 2. Muestra información en modo de solo lectura
 * // 3. Permite editar teléfono y correo personal
 * // 4. Guarda cambios mediante /api/updateUser
 * // 5. Proporciona feedback visual con alertas
 * ```
 *
 * @see {@link ProfilePicture} - Componente de avatar circular con iniciales
 * @see {@link Alerta} - Componente para mostrar mensajes de estado al usuario
 */
export default function Profile() {
  /** Estado que almacena el nombre del usuario. */
  const [name, setname] = useState("");

  /** Estado que almacena los apellidos del usuario. */
  const [lastname, setlastname] = useState("");

  /** Estado que almacena el correo corporativo del usuario. */
  const [mail, setmail] = useState("");

  /** Estado que almacena el rol del usuario. */
  const [role, setrole] = useState("");

  /** Estado que almacena el teléfono del usuario (editable). */
  const [tel, setTel] = useState("");

  /** Estado que almacena el correo personal del usuario (editable). */
  const [emailSecundario, setEmailSecundario] = useState("");

  /** Estado que almacena el género del usuario. */
  const [genero, setGenero] = useState("");

  /** Estado que almacena el puesto laboral del usuario. */
  const [puesto, setPuesto] = useState("");

  /** Estado que almacena el área de trabajo del usuario. */
  const [area, setArea] = useState("");

  /** Estado que controla si el modo de edición está activo. */
  const [edit, setEdit] = useState(false);

  /** Estado que almacena el email original para las peticiones de actualización. */
  const [originalEmail, setOriginalEmail] = useState("");

  /** Estado que indica si hay una operación de carga en progreso. */
  const [loading, setLoading] = useState(true);

  /** Tipo que define las clasificaciones de alerta disponibles. */
  type clasifAlerta = "aprobado" | "denegado" | "errorSist" | "info";

  /** Estado que almacena la alerta actual a mostrar al usuario. */
  const [alerta, setAlerta] = useState<{
    type: clasifAlerta;
    mensaje: string;
  } | null>(null);

  useEffect(() => {
    /**
     * Obtiene los datos completos del usuario actual desde la API.
     *
     * Esta función consulta el endpoint getCurrentUser para cargar toda
     * la información del perfil del usuario autenticado y actualiza los
     * estados locales correspondientes. Maneja errores de conexión y
     * proporciona feedback visual mediante alertas.
     */
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
        setGenero(jason.genero);
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

  /**
   * Maneja la alternancia entre modo de visualización y edición del perfil.
   *
   * Esta función controla el flujo de edición del perfil:
   * - Si está en modo visualización, activa el modo de edición
   * - Si está en modo edición, guarda los cambios realizados
   *
   * En el modo de guardado, envía los datos actualizados al servidor
   * mediante la API updateUser y proporciona feedback visual del resultado.
   */
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

        // Incluir email secundario (puede ser vacío o null)
        updateData.emailSecundario = emailSecundario || null;

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

  return (
    <div className="p-4">
      {/* Alerta en la parte superior */}
      {alerta && (
        <div className="mb-4 flex justify-center">
          <Alerta tipo={alerta.type} mensaje={alerta.mensaje} />
        </div>
      )}

      {/* Contenedor principal centrado */}
      <div className="items-start justify-start">
        <h1
          className={
            "text-4xl text-[#212529] pl-4 font-bold mb-4 animate-fade-in-up"
          }
        >
          Perfil de Usuario
        </h1>
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full">
          <div className="flex row mb-6 space-x-10 items-center">
            <ProfilePicture
              nombre={name}
              width={"w-20"}
              height={"h-20"}
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
          </div>

          <div className="space-y-4">
            <p className="text-xl font-semibold text-[#212529]">
              Mi información
            </p>
            <div>
              <label className="text-gray-600 text-sm">Rol</label>
              <p className="text-lg font-medium">{role}</p>
            </div>

            <div>
              <label className="text-gray-600 text-sm">Área</label>
              <p className="text-lg font-medium">{area}</p>
            </div>

            <div>
              <label className="text-gray-600 text-sm">Puesto</label>
              <p className="text-lg font-medium">{puesto}</p>
            </div>

            <div className="flex row mb-6 space-x-20">
              <div>
                <label className="text-gray-600 text-sm">
                  Correo Corporativo
                </label>
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
                  <p className="text-lg font-medium">
                    {emailSecundario || "No configurado"}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="text-gray-600 text-sm">Género</label>
              <p className="text-lg font-medium">{genero}</p>
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
