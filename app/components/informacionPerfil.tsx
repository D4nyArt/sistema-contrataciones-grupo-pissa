/**
 * informacionPerfil.tsx
 *
 * Proporciona una interfaz de solo lectura para mostrar información completa del perfil de usuario.
 *
 * Este componente presenta todos los datos personales y laborales del usuario de forma organizada
 * en un formulario de solo lectura. Extrae automáticamente el ID del usuario desde la URL,
 * recupera la información desde Firebase Realtime Database y la muestra en campos deshabilitados
 * con iconos descriptivos para cada tipo de información.
 */

import { database } from "@/firebaseConfig";
import { get, ref } from "firebase/database";
import {
  Briefcase,
  BriefcaseBusiness,
  Mail,
  Phone,
  User,
  VenusAndMars,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";
import { urbanist } from "./fonts";

/**
 * Renderiza una interfaz completa de visualización de información del perfil de usuario.
 *
 * Este componente obtiene automáticamente el ID del usuario desde la URL de la página actual,
 * consulta Firebase Realtime Database para recuperar todos los datos del perfil y los presenta
 * en un formulario organizado de solo lectura. Incluye información personal (nombre, apellidos,
 * género, contacto) y laboral (puesto, área, correo corporativo) con iconos descriptivos
 * para cada campo y animaciones suaves de entrada.
 *
 * @returns El elemento JSX que renderiza la información completa del perfil de usuario.
 *
 * @example
 * ```tsx
 * // Uso en página de perfil de usuario
 * // URL esperada: /dashboard/perfil/[userId] o /candidato/perfil/[userId]
 * <div className="profile-page">
 *   <h1>Perfil de Usuario</h1>
 *   <InfoPerfil />
 * </div>
 *
 * // El componente automáticamente:
 * // 1. Extrae el ID del usuario de la URL
 * // 2. Consulta Firebase Database para obtener datos
 * // 3. Muestra la información en campos de solo lectura
 * // 4. Aplica iconos apropiados para cada tipo de dato
 * ```
 */
export default function InfoPerfil() {
  /** Hook para obtener la ruta actual de la página. */
  const pathname = usePathname();

  /** Estado que almacena el nombre del usuario. */
  const [name, setName] = useState("");

  /** Estado que almacena los apellidos del usuario. */
  const [lastname, setLastname] = useState("");

  /** Estado que almacena el correo personal del usuario. */
  const [mail, setMail] = useState("");

  /** Estado que almacena el teléfono del usuario. */
  const [phone, setPhone] = useState("");

  /** Estado que almacena el correo corporativo del usuario. */
  const [email_corporativo, setEmailCorporativo] = useState("");

  /** Estado que almacena el género del usuario. */
  const [genero, setGenero] = useState("");

  /** Estado que almacena el puesto laboral del usuario. */
  const [puesto, setPuesto] = useState("");

  /** Estado que almacena el área de trabajo del usuario. */
  const [area, setArea] = useState("");

  /** ID del usuario extraído desde la URL actual. */
  const id = pathname.split("/")[2];

  /**
   * Manejadores de cambio para los campos de entrada (actualmente no utilizados ya que los campos están deshabilitados).
   */
  const handleNameChange = (e: { target: { value: SetStateAction<string> } }) =>
    setName(e.target.value);
  const handleLastnameChange = (e: {
    target: { value: SetStateAction<string> };
  }) => setLastname(e.target.value);
  const handleMailChange = (e: { target: { value: SetStateAction<string> } }) =>
    setMail(e.target.value);
  const handlePhoneChange = (e: {
    target: { value: SetStateAction<string> };
  }) => setPhone(e.target.value);

  useEffect(() => {
    /**
     * Obtiene la información completa del usuario desde Firebase Database.
     *
     * Esta función consulta la base de datos usando el ID extraído de la URL
     * para recuperar todos los datos del perfil del usuario y actualiza los
     * estados correspondientes. Maneja casos donde algunos datos pueden no existir.
     */
    const fetchUser = async () => {
      try {
        const userRef = ref(database, `usuarios/${id}`);
        const snapshot = await get(userRef);
        const data = snapshot.val() || {};
        setName(data.nombre || "");
        setLastname(data.apellidos || "");
        setMail(data.email || "");
        setPhone(data.telefono || "");
        setEmailCorporativo(data.email_corporativo || "");
        setGenero(data.genero || "");
        setPuesto(data.puesto || "");
        setArea(data.area || "");
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, [id]);

  return (
    <main className="bg-white rounded-xl p-4 shadow-md">
      <div className="border-b pb-2 mb-6 border-gray-300 animate-fade-in-up">
        <h2
          className={`${urbanist.className} text-xl font-semibold text-[#212529]`}
        >
          Información Básica
        </h2>
      </div>
      <div className="flex flex-col justify-center md:grid md:grid-cols-2 gap-6 animate-fade-in-up">
        <div>
          <label className="text-[#495057] block mb-1">Nombre</label>
          <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
            <input
              type="text"
              name="nombre"
              disabled
              value={name}
              onChange={handleNameChange}
              className="flex-1 outline-none w-1/2"
            ></input>
            <User className="ml-2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="text-[#495057] block mb-1">Apellidos</label>
          <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
            <input
              type="text"
              name="apellidos"
              disabled
              value={lastname}
              onChange={handleLastnameChange}
              className="flex-1 outline-none w-1/2"
            ></input>
            <User className="ml-2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="text-[#495057] block mb-1">Correo Personal</label>
          <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
            <input
              type="text"
              name="nombre"
              disabled
              value={mail}
              onChange={handleMailChange}
              className="flex-1 outline-none w-1/2"
            ></input>
            <Mail className="ml-2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="text-[#495057] block mb-1">
            Correo Corporativo
          </label>
          <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
            <input
              type="text"
              name="nombre"
              disabled
              value={email_corporativo}
              onChange={handleMailChange}
              className="flex-1 outline-none w-1/2"
            ></input>
            <Mail className="ml-2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="text-[#495057] block mb-1">Teléfono</label>
          <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
            <input
              type="text"
              name="nombre"
              disabled
              value={phone}
              onChange={handlePhoneChange}
              className="flex-1 outline-none w-1/2"
            ></input>
            <Phone className="ml-2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="text-[#495057] block mb-1">Género</label>
          <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
            <input
              type="text"
              name="genero"
              disabled
              value={genero}
              onChange={handleLastnameChange}
              className="flex-1 outline-none w-1/2"
            ></input>
            <VenusAndMars className="ml-2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="text-[#495057] block mb-1">Puesto</label>
          <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
            <input
              type="text"
              name="genero"
              disabled
              value={puesto}
              onChange={handleLastnameChange}
              className="flex-1 outline-none w-1/2"
            ></input>
            <Briefcase className="ml-2 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="text-[#495057] block mb-1">Área</label>
          <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white md:w-md">
            <input
              type="text"
              name="genero"
              disabled
              value={area}
              onChange={handleLastnameChange}
              className="flex-1 outline-none w-1/2"
            ></input>
            <BriefcaseBusiness className="ml-2 text-gray-400" />
          </div>
        </div>
      </div>
    </main>
  );
}
