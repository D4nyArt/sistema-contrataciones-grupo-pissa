/* DOCUMENTACIÓN - Generación de credenciales

Estados de los usuarios:

* previo: cuando el candidato recién tiene credenciales y no ha generado su contraseña por primera vez
* normal: usuario activo
* bloqueado: cuando el usuario bloqueó su cuenta por 3 inicios de sesión incorrectos
* enProceso: cuando se hizo la solicitud de recuperación de la cuenta
* inhabilitado: cuando RH revoca los privilegios de acceso de la cuenta.
* baja: Cuando el usuario fue bloqueado de manera permanente

*/

"use client";

import React, { useEffect, useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import { database, auth } from "../../firebaseConfig";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Briefcase, BriefcaseBusiness, Building, Mail, Phone, User, VenusAndMars } from "lucide-react";
import { eventNames } from "process";
import { urbanist } from "./fonts";
//import crypto from "crypto";

const generatePassword = () => {
  return "123456";
};

/*
const generatePassword = (length: number = 16) => {
  return crypto.randomBytes(length).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, length);
};*/
export default function CreateCredentials() {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [mail, setMail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("candidato");
  const [ownrole, setOwnRole] = useState("");
  const [email_corporativo, setEmailCorporativo] = useState("");
  const [genero, setGenero] = useState("");
  const [puesto, setPuesto] = useState("");
  const [area, setArea] = useState("");

  const handlePress = async () => {
    // Generamos una contraseña (opcional: podrías permitir que el usuario defina la suya)
    const password = generatePassword();

    try {
      // Crear el usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        mail,
        password
      );
      const uid = userCredential.user.uid;

      // Preparamos los datos para guardar en la Realtime Database.
      // NOTA: No se almacena la contraseña en la base de datos, ya que Firebase Auth se encarga de ello.
      let data = {};

      if (role === "rh") {
        data = {
          apellidos: lastname,
          email: mail,
          email_corporativo: email_corporativo,
          estadoUsuario: "previo",
          genero: genero,
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
          genero: genero,
          puesto: puesto,
          area: area,
          nombre: name,
          rol: role,
          telefono: phone,
          contrato_activo: "NaC",
          revisor: "sin_revisor",
        };
      }

      // Guardamos los datos del usuario usando el UID como key
      await set(ref(database, "usuarios/" + uid), data);

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
    const checkAdmin = async () => {

        const res = await fetch("/api/getCurrentUser");
        const jason = await res.json();
        setOwnRole(jason.rol);

    }
    checkAdmin();
  }, [ownrole])

  return (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className="border-b pb-2 mb-6 border-gray-300 animate-fade-in-up">
          <h2
            className={`${urbanist.className} text-xl font-semibold text-[#212529]`}
          >
            Información Básica
          </h2>
        </div>
        <div className="flex flex-col justify-center md:grid lg:grid-cols-2 md:grid-cols-2 gap-6 animate-fade-in-up">
          <div>
            <label className="text-[#495057] block mb-1">Nombre</label>
            <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
              <input
                type="text"
                className="flex-1 outline-none w-1/2"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <User className="ml-2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-[#495057] block mb-1">Apellidos</label>
            <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
              <input
                type="text"
                className="flex-1 outline-none w-1/2"
                value={lastname}
                onChange={(event) => setLastname(event.target.value)}
              />
              <User className="ml-2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-[#495057] block mb-1">Correo Personal</label>
            <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
              <input
                type="email"
                className="flex-1 outline-none w-1/2"
                value={mail}
                onChange={(event) => setMail(event.target.value)}
              />
              <Mail className="ml-2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-[#495057] block mb-1">Correo Corporativo</label>
            <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
              <input
                type="email"
                className="flex-1 outline-none w-1/2"
                value={email_corporativo}
                onChange={(event) => setEmailCorporativo(event.target.value)}
              />
              <Building className="ml-2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-[#495057] block mb-1">Teléfono</label>
            <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
              <PhoneInput
                international
                defaultCountry="MX"
                value={"+52"}
                onChange={(value) => setPhone(value || "")}
                className="flex-1 outline-none w-1/2"
                style={{
                  '--PhoneInputCountryFlag-height': '1em',
                  '--PhoneInput-color--focus': '#ffffff'
                }}
              />
              <Phone className="ml-2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-[#495057] block mb-1">Género</label>
            <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
              <select
                className="flex-1 outline-none w-1/2"
                value={genero}
                onChange={(event) => setGenero(event.target.value)}
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
              <VenusAndMars className="ml-2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-[#495057] block mb-1">Puesto</label>
            <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
              <input
                type="text"
                className="flex-1 outline-none w-1/2"
                value={puesto}
                onChange={(event) => setPuesto(event.target.value)}
              />
              <Briefcase className="ml-2 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="text-[#495057] block mb-1">Área</label>
            <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
              <input
                type="text"
                className="flex-1 outline-none w-1/2"
                value={area}
                onChange={(event) => setArea(event.target.value)}
              />
              <BriefcaseBusiness className="ml-2 text-gray-400" />
            </div>
          </div>
          {ownrole === "admin" ?
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
          </div> : <></>
          }
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
