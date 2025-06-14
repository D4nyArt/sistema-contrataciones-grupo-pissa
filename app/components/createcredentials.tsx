/**
 * createcredentials.tsx
 *
 * Proporciona un formulario completo para crear credenciales de nuevos usuarios en el sistema.
 *
 * Este componente permite a administradores y personal de RH registrar nuevos usuarios con
 * información personal, corporativa y de contacto. Maneja la creación automática de cuentas
 * en Firebase Auth, validación de campos obligatorios y configuración inicial de perfiles
 * de usuario en la base de datos con estados apropiados según el rol asignado.
 *
 * Estados de los usuarios:
 * - previo: cuando el candidato recién tiene credenciales y no ha generado su contraseña por primera vez
 * - normal: usuario activo
 * - bloqueado: cuando el usuario bloqueó su cuenta por 3 inicios de sesión incorrectos
 * - enProceso: cuando se hizo la solicitud de recuperación de la cuenta
 * - inhabilitado: cuando RH revoca los privilegios de acceso de la cuenta
 * - baja: Cuando el usuario fue bloqueado de manera permanente
 */

"use client";

import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { database, auth } from "../../firebaseConfig";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import {
  Briefcase,
  BriefcaseBusiness,
  Building,
  Mail,
  Phone,
  User,
  VenusAndMars,
} from "lucide-react";
//import { urbanist } from "./fonts";
import sendEmailNotification from "../components/sendEmailNotification";
import crypto from "crypto";
import { addHistoryEntry } from "../api/history/history";
import { getAuth } from "firebase/auth";

const authV2 = getAuth();
const rhID = authV2.currentUser?.uid;

const generatePassword = (length: number = 16) => {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, length);
};

export default function CreateCredentials() {
  /** Estado para el nombre del usuario. */
  const [name, setName] = useState("");

  /** Estado para los apellidos del usuario. */
  const [lastname, setLastname] = useState("");

  /** Estado para el correo personal del usuario. */
  const [mail, setMail] = useState("");

  /** Estado para el número de teléfono del usuario. */
  const [phone, setPhone] = useState("");

  /** Estado para el rol del usuario (candidato por defecto). */
  const [role, setRole] = useState("candidato");

  /** Estado para el rol del usuario actual (para validar permisos). */
  const [ownrole, setOwnRole] = useState("");

  /** Estado para el correo corporativo del usuario. */
  const [email_corporativo, setEmailCorporativo] = useState("");

  /** Estado para el género del usuario. */
  const [sexo, setSexo] = useState("");

  /** Estado para el puesto de trabajo del usuario. */
  const [puesto, setPuesto] = useState("");

  /** Estado para el área de trabajo del usuario. */
  const [area, setArea] = useState("");

  /** Estado que maneja los errores de validación del formulario. */
  const [errors, setErrors] = useState({
    name: false,
    lastname: false,
    mail: false,
    phone: false,
    email_corporativo: false,
    sexo: false,
    puesto: false,
    area: false,
  });

  /**
   * Valida todos los campos obligatorios del formulario.
   *
   * Esta función verifica que todos los campos requeridos estén completados
   * y actualiza el estado de errores para mostrar indicadores visuales.
   *
   * @returns true si todos los campos son válidos, false en caso contrario.
   */
  const validateFields = (): boolean => {
    const newErrors = {
      name: !name.trim(),
      lastname: !lastname.trim(),
      mail: !mail.trim(),
      phone: !phone || phone === "+52",
      email_corporativo: !email_corporativo.trim(),
      sexo: !sexo,
      puesto: !puesto,
      area: !area.trim(),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  /**
   * Maneja el proceso de creación de credenciales del usuario.
   *
   * Esta función valida el formulario, crea la cuenta en Firebase Auth,
   * configura el perfil del usuario en la base de datos con los datos
   * apropiados según el rol asignado, y muestra confirmación o errores.
   */
  const handlePress = async (): Promise<void> => {
    if (!validateFields()) {
      alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    const password = generatePassword();

    try {
      // Crear el usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        mail,
        password
      );
      const uid = userCredential.user.uid;

      // Preparar los datos del usuario según el rol
      let data: {};

      if (role === "rh") {
        data = {
          apellidos: lastname,
          email: mail,
          email_corporativo: email_corporativo,
          estadoUsuario: "previo",
          sexo: sexo,
          puesto: puesto,
          area: area,
          nombre: name,
          rol: role,
          telefono: phone,
          contrato_activo: "NaC",
          revisando: {},
        };
      } else {
        data = {
          apellidos: lastname,
          email: mail,
          email_corporativo: email_corporativo,
          estadoUsuario: "previo",
          sexo: sexo,
          puesto: puesto,
          area: area,
          nombre: name,
          rol: role,
          telefono: phone,
          contrato_activo: "NaC",
          revisor: "sin_revisor",
        };
      }

      // Guardar los datos del usuario en la base de datos
      await set(ref(database, "usuarios/" + uid), data);
      await sendEmailNotification(
        uid,
        `Se han generado tus credenciales`,
        `Hola,\n\nYa puedes acceder al sistema https://www.grupo-pissa.space/ ingresando las siguientes credenciales:\n\nCorreo electrónico: ${mail}\nContraseña: ${password}\n\nSaludos,\nEquipo Grupo Pissa`
      );

      await addHistoryEntry(
        uid,
        "documentos",
        new Date().toISOString(),
        rhID,
        "Generación de Credenciales"
      );
      alert(
        "Se han creado las credenciales exitosamente. UID del usuario: " + uid
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error al crear el usuario:", error);
        alert("Error al crear credenciales: " + error.message);
      } else {
        console.error("Error al crear el usuario:", error);
        alert("Error al crear credenciales.");
      }
    }
  };

  useEffect(() => {
    /**
     * Verifica el rol del usuario actual para mostrar opciones apropiadas.
     *
     * Esta función consulta la API para obtener el rol del usuario autenticado
     * y determinar si tiene permisos para asignar roles específicos.
     */
    const checkAdmin = async (): Promise<void> => {
      const res = await fetch("/api/getCurrentUser");
      const jason = await res.json();
      setOwnRole(jason.rol);
    };
    checkAdmin();
  }, [ownrole]);

  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <div className="bg-white rounded-xl p-4 shadow-md animate-fade-in-up">
        <div className="border-b pb-2 mb-6 border-gray-300">
          <p className="mt-2 text-[#495057]">
            Completa el formulario para crear nuevas credenciales.
          </p>
        </div>
        <div className="flex flex-col justify-center md:grid lg:grid-cols-2 md:grid-cols-2 gap-6">
          {/* Campo Nombre */}
          <div>
            <label className="text-[#495057] block mb-1">Nombre</label>
            <div
              className={`flex items-center p-2 border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-lg bg-white md:w-md`}
            >
              <input
                type="text"
                className="flex-1 outline-none w-1/2"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (errors.name && event.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, name: false }));
                  }
                }}
              />
              <User className="ml-2 text-gray-400" />
            </div>
          </div>

          {/* Campo Apellidos */}
          <div>
            <label className="text-[#495057] block mb-1">Apellidos</label>
            <div
              className={`flex items-center p-2 border ${
                errors.lastname ? "border-red-500" : "border-gray-300"
              } rounded-lg bg-white md:w-md`}
            >
              <input
                type="text"
                className="flex-1 outline-none w-1/2"
                value={lastname}
                onChange={(event) => {
                  setLastname(event.target.value);
                  if (errors.lastname && event.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, lastname: false }));
                  }
                }}
              />
              <User className="ml-2 text-gray-400" />
            </div>
          </div>

          {/* Campo Correo Personal */}
          <div>
            <label className="text-[#495057] block mb-1">Correo Personal</label>
            <div
              className={`flex items-center p-2 border ${
                errors.mail ? "border-red-500" : "border-gray-300"
              } rounded-lg bg-white md:w-md`}
            >
              <input
                type="email"
                className="flex-1 outline-none w-1/2"
                value={mail}
                onChange={(event) => {
                  setMail(event.target.value);
                  if (errors.mail && event.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, mail: false }));
                  }
                }}
              />
              <Mail className="ml-2 text-gray-400" />
            </div>
          </div>

          {/* Campo Correo Corporativo */}
          <div>
            <label className="text-[#495057] block mb-1">
              Correo Corporativo
            </label>
            <div
              className={`flex items-center p-2 border ${
                errors.email_corporativo ? "border-red-500" : "border-gray-300"
              } rounded-lg bg-white md:w-md`}
            >
              <input
                type="email"
                className="flex-1 outline-none w-1/2"
                value={email_corporativo}
                onChange={(event) => {
                  setEmailCorporativo(event.target.value);
                  if (errors.email_corporativo && event.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      email_corporativo: false,
                    }));
                  }
                }}
              />
              <Building className="ml-2 text-gray-400" />
            </div>
          </div>

          {/* Campo Teléfono */}
          <div>
            <label className="text-[#495057] block mb-1">Teléfono</label>
            <div
              className={`flex items-center p-2 border ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } rounded-lg bg-white md:w-md`}
            >
              <PhoneInput
                international
                defaultCountry="MX"
                value={"+52"}
                onChange={(value) => {
                  setPhone(value || "");
                  if (errors.phone && value && value !== "+52") {
                    setErrors((prev) => ({ ...prev, phone: false }));
                  }
                }}
                className="flex-1 outline-none w-1/2"
                style={{
                  "--PhoneInputCountryFlag-height": "1em",
                  "--PhoneInput-color--focus": "#ffffff",
                }}
              />
              <Phone className="ml-2 text-gray-400" />
            </div>
          </div>

          {/* Campo Género */}
          <div>
            <label className="text-[#495057] block mb-1">Sexo</label>
            <div
              className={`flex items-center p-2 border ${
                errors.sexo ? "border-red-500" : "border-gray-300"
              } rounded-lg bg-white md:w-md`}
            >
              <select
                className="flex-1 outline-none w-1/2"
                value={sexo}
                onChange={(event) => {
                  setSexo(event.target.value);
                  if (errors.sexo && event.target.value) {
                    setErrors((prev) => ({ ...prev, sexo: false }));
                  }
                }}
              >
                <option value="" disabled></option>
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
                <option value="Otro">Otro</option>
              </select>
              <VenusAndMars className="ml-2 text-gray-400" />
            </div>
          </div>

          {/* Campo Puesto */}
          <div>
            <label className="text-[#495057] block mb-1">Puesto</label>
            <div
              className={`flex items-center p-2 border ${
                errors.puesto ? "border-red-500" : "border-gray-300"
              } rounded-lg bg-white md:w-md`}
            >
              <select
                className="flex-1 outline-none w-1/2"
                value={puesto}
                onChange={(event) => {
                  setPuesto(event.target.value);
                  if (errors.puesto && event.target.value) {
                    setErrors((prev) => ({ ...prev, puesto: false }));
                  }
                }}
              >
                <option value="" disabled></option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="lider_de_proyecto">Líder de Proyecto</option>
                <option value="auxiliar_administrativo">
                  Auxiliar Administrativo
                </option>
                <option value="soporte_tecnico">Soporte Técnico</option>
                <option value="asistente">Asistente</option>
                <option value="chofer_ejecutivo">Chofer Ejecutivo</option>
                <option value="ingeniero_en_redes">Ingeniero en Redes</option>
                <option value="lider_de_proyecto_jr">
                  Líder de Proyecto Jr.
                </option>
                <option value="contador_jr">Contador Jr.</option>
                <option value="jefe_ingenieria_de_software">
                  Jefe Ingeniería de Software
                </option>
                <option value="mesa_de_servicios">Mesa de servicios</option>
                <option value="reclutador">Reclutador</option>
                <option value="facturación_y_cobranza">
                  Facturación y Cobranza
                </option>
                <option value="licitador">Licitador</option>
                <option value="contador_general">Contador General</option>
                <option value="recepcionista">Recepcionista</option>
                <option value="coordinador_de_nomina">
                  Coordinador de Nomina
                </option>
                <option value="personal_de_limpieza">
                  Personal de limpieza
                </option>
                <option value="field_service">Field Service</option>
                <option value="gerente_de_operaciones_y_proyectos">
                  Gerente de operaciones y Proye
                </option>
                <option value="reclutador_sr">Reclutador Sr.</option>
                <option value="chofer">Chofer</option>
                <option value="contralor">Contralor</option>
                <option value="tesorero">Tesorero</option>
                <option value="almacenista">Almacenista</option>
                <option value="lider_de_infraestructura">
                  Líder de Infraestructura
                </option>
                <option value="mensajero">Mensajero</option>
                <option value="lider_administrativo_de_proyec">
                  Líder Administrativo de Proyectos
                </option>
                <option value="comprador">Comprador</option>
                <option value="ejecutivo_de_cuentas">
                  Ejecutivo de Cuentas
                </option>
                <option value="arq_soluciones">Arquitecto de Soluciones</option>
                <option value="senior_manager">Limpiador</option>
                <option value="tecnico_lexmark">Técnico LEXMARK</option>
                <option value="lider_rh">Líder RH</option>
                <option value="lider_de_admon_y_finanzas">
                  Líder de admon. y finanzas
                </option>
              </select>
              <Briefcase className="ml-2 text-gray-400" />
            </div>
          </div>

          {/* Campo Área */}
          <div>
            <label className="text-[#495057] block mb-1">Área</label>
            <div
              className={`flex items-center p-2 border ${
                errors.area ? "border-red-500" : "border-gray-300"
              } rounded-lg bg-white md:w-md`}
            >
              <input
                type="text"
                className="flex-1 outline-none w-1/2"
                value={area}
                onChange={(event) => {
                  setArea(event.target.value);
                  if (errors.area && event.target.value.trim()) {
                    setErrors((prev) => ({ ...prev, area: false }));
                  }
                }}
              />
              <BriefcaseBusiness className="ml-2 text-gray-400" />
            </div>
          </div>

          {/* Selector de Rol (solo para admin) */}
          {ownrole === "admin" ? (
            <div>
              <label className="text-[#495057] block mb-1">Rol</label>
              <div className="flex space-x-2">
                <div className="flex flex-row">
                  <input
                    type="radio"
                    value="candidato"
                    onChange={(event) => {
                      setRole(event.target.value);
                    }}
                    checked={role === "candidato"}
                  />
                  <p className="pl-2">Candidato</p>
                </div>
                <div className="flex flex-row">
                  <input
                    type="radio"
                    value="rh"
                    onChange={(event) => {
                      setRole(event.target.value);
                    }}
                    checked={role === "rh"}
                  />
                  <p className="pl-2">RH</p>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          {/* Botón de Crear Credenciales */}
          <div className="flex justify-center items-center md:block">
            <button
              className="bg-[#2d4583] text-white py-2 px-6 text-center rounded-lg cursor-pointer hover:bg-[#08b177] transition text-lg"
              onClick={handlePress}
            >
              Crear Credenciales
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
