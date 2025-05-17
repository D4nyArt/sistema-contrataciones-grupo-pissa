"use client";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { database } from "../../firebaseConfig";
import { ref, get, set } from "firebase/database";
import ProfilePicture from "./profile-picture";
import {
  CircleCheck,
  CircleUser,
  Clock,
  Lock,
  LockOpen,
  Mail,
  Phone,
  UserMinus,
} from "lucide-react";
import { urbanist } from "./fonts";

/*
interface User {
  id: string;
  nombre?: string;
  apellidos?: string;
  rol?: string;
  email?: string;
  telefono?: string;
}*/

export default function Contratos({ id }: { id: string }) {
  // const router = useRouter();

  // const searchparams = useSearchParams();
  const [name, setName] = useState("");



useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log(`contratos/corporativo/${id}`);
        const userRef = ref(database, `contratos/proyectos/${id}`);
        const snapshot = await get(userRef);
        let data = snapshot.val() || {};
        
        //if the contract is not in "proyectos" search in "corporativo"
        if (!Object.keys(data).length) {
          const userRef = ref(database, `contratos/corporativo/${id}`);
          const snapshot = await get(userRef);
          data = snapshot.val() || {};
        }

        console.log(data);
        setName(data.name || "");
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, [id]);

  return (
    <div>
      <div className="flex flex-col md:flex-row items-center {/*border-b border-gray-300*/} pb-6">
        <ProfilePicture
          nombre={`${name}`}
          width={"w-15"}
          height={"h-15"}
          textSize={"text-3xl"}
        />
        <span className="pl-4">
          <div>
            <div className="flex flex-row items-center">
              <strong
                className={`${urbanist.className} text-2xl text-[#212529]`}>
                {name || "name"}
              </strong>
            </div>
          </div>
        </span>
        
      </div>
      <div className="pb-6 pt-2 border-b border-gray-300 text-sm">
        <table className="table-auto text-[#495057]">
          <tbody>
            <tr>
              <td className="inline-flex pr-8">
                <CircleUser className="pr-2" />
                ID del Contrato
              </td>
              <td>{id}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
