"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProfilePicture from "./profile-picture";
import { Mail, Phone } from "lucide-react";
import { urbanist } from "./fonts";

import type { User } from "@/app/types/user";
import EtiquetaEstado from "./etiquetaEstado";

export default function UserCard({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullPath = `${pathname}?${searchParams.toString()}`;
  let userRole = "N/A";
  if (user.rol === "enProyecto") {
    userRole = "En Proyecto";
  } else if (user.rol === "enCorporativo") {
    userRole = "En Corporativo";
  } else if (user.rol === "rh") {
    userRole = "RH";
  } else if (user.rol === "admin") {
    userRole = "ADMIN";
  } else if (user.rol === "candidato") {
    userRole = "Candidato"
  }

  return (
    <div
      onClick={() =>
        router.push(
          `/dashboard/${user.id}?from=${encodeURIComponent(fullPath)}`
        )
      }
      className="cursor-pointer p-4 bg-white rounded-xl shadow-md transition-transform transform hover:scale-105 flex flex-col animate-fade-in-up"
    >
      <div className="flex flex-col border-b border-gray-200 mb-4">
        <div className="flex items-center">
          <div className="flex-none">
            <ProfilePicture
              nombre={`${user.nombre || ""}`}
              width="w-11"
              height="h-11"
              textSize="text-2xl"
            />
          </div>
          <div className="ml-4">
            <p
              className={`${urbanist.className} text-lg font-semibold text-black flex-auto`}
            >
              {user.nombre || "N/A"} {user.apellidos || ""}
            </p>
            <p className="text-sm text-[#2975a0] capitalize">
              {userRole || "N/A"}
            </p>            
          </div>
        </div>
        <div className="mt-4 mb-4 flex">
          <EtiquetaEstado status={user.estadoUsuario ?? ""} />
        </div>
      </div>
      <div className="">
        <div className="text-xs text-[#495057] flex items-center">
          <Mail className="pr-2 flex-none" /> 
          <p className="flex-auto">{user.email || "N/A"}</p>
        </div>
        <div className="text-xs text-[#495057] flex items-center">
           <Phone className="pr-2 flex-none" />
           <p className="flex-auto">{user.telefono || "N/A"}</p>
        </div>
      </div>
    </div>
  );
}
