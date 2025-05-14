import { database } from "@/firebaseConfig";
import { get, ref } from "firebase/database";
import { Briefcase, Mail, Pencil, Phone, User, VenusAndMars } from "lucide-react";
import { usePathname } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";

export default function InfoPerfil () {
    const pathname = usePathname();
    const [name, setName] = useState("");
    const [lastname, setLastname] = useState("");
    const [mail, setMail] = useState("");
    const [phone, setPhone] = useState("");
    const id = pathname.split("/")[2];

    const handleNameChange = (e: { target: { value: SetStateAction<string>; }; }) => setName(e.target.value);
    const handleLastnameChange = (e: { target: { value: SetStateAction<string>; }; }) => setLastname(e.target.value);
    const handleMailChange = (e: { target: { value: SetStateAction<string>; }; }) => setMail(e.target.value);
    const handlePhoneChange = (e: { target: { value: SetStateAction<string>; }; }) => setPhone(e.target.value);


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
          } catch (e) {
            console.error(e);
          }
        };
        fetchUser();
    }, [id]);

    return(
        <main className="bg-white rounded-xl p-4  shadow-md">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="text-[#495057] block mb-1">Nombre</label>
                    <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white w-md">
                        <input 
                            type="text" 
                            name="nombre"
                            disabled 
                            value={name}
                            onChange={handleNameChange}
                            className="flex-1 outline-none"
                        ></input>
                        <User className="ml-2 text-gray-400"/>
                    </div>
                </div>
                <div>
                    <label className="text-[#495057] block mb-1">Apellidos</label>
                    <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white w-md">
                        <input 
                            type="text" 
                            name="apellidos"
                            disabled  
                            value={lastname}
                            onChange={handleLastnameChange} 
                            className="flex-1 outline-none"
                        ></input>
                        <User className="ml-2 text-gray-400"/>
                    </div>
                </div>
                <div>
                    <label className="text-[#495057] block mb-1">Género</label>
                    <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white w-md">
                        <input 
                            type="text" 
                            name="genero"
                            disabled
                            onChange={handleLastnameChange} 
                            className="flex-1 outline-none"
                        ></input>
                        <VenusAndMars className="ml-2 text-gray-400"/>
                    </div>
                </div>
                <div>
                    <label className="text-[#495057] block mb-1">Puesto</label>
                    <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white w-md">
                        <input 
                            type="text" 
                            name="genero"
                            disabled
                            onChange={handleLastnameChange} 
                            className="flex-1 outline-none"
                        ></input>
                        <Briefcase className="ml-2 text-gray-400"/>
                    </div>
                </div>
                <div>
                    <label className="text-[#495057] block mb-1">Correo</label>
                    <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white w-md">
                        <input 
                            type="text" 
                            name="nombre" 
                            disabled 
                            value={mail}
                            onChange={handleMailChange}
                            className="flex-1 outline-none"
                        ></input>
                        <Mail className="ml-2 text-gray-400"/>
                    </div>
                </div>
                <div>
                    <label className="text-[#495057] block mb-1">Correo Personal</label>
                    <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white w-md">
                        <input 
                            type="text" 
                            name="nombre" 
                            disabled
                            onChange={handleMailChange}
                            className="flex-1 outline-none"
                        ></input>
                        <Mail className="ml-2 text-gray-400"/>
                    </div>
                </div>
                <div>
                    <label className="text-[#495057] block mb-1">Teléfono</label>
                    <div className="flex items-center p-2 border border-gray-300 rounded-lg bg-white w-md">
                        <input 
                            type="text" 
                            name="nombre" 
                            disabled 
                            value={phone}
                            onChange={handlePhoneChange} 
                            className="flex-1 outline-none"
                        ></input>
                        <Phone className="ml-2 text-gray-400"/>
                    </div>    
                </div>
            </div>
        </main>
    )
}