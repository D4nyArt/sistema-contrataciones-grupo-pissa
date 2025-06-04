import { database } from "@/firebaseConfig";
import { get, ref } from "firebase/database";
import { Briefcase, BriefcaseBusiness, Mail, Phone, User, VenusAndMars } from "lucide-react";
import { usePathname } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";
import { urbanist } from "./fonts";

export default function InfoPerfil() {
  const pathname = usePathname();
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [mail, setMail] = useState("");
  const [phone, setPhone] = useState("");
  const id = pathname.split("/")[2];
  const [email_corporativo, setEmailCorporativo] = useState("");
  const [genero, setGenero] = useState("");
  const [puesto, setPuesto] = useState("");
  const [area, setArea] = useState("");

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
    <main className="bg-white rounded-xl p-4  shadow-md">
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
          <label className="text-[#495057] block mb-1">Correo Corporativo</label>
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
