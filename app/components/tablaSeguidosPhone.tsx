"use client";

import React from "react";
import ProfilePicture from "./profile-picture";
//import EtiquetaEstado from "./etiquetaEstado";
import { ArrowUpRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface RevisandoEntry {
  candidateUID: string;
  since: string;
  nombre: string;
  apellidos: string;
  estadoUsuario: string;
  email: string;
}

interface TablaRevisandoProps {
  datos: RevisandoEntry[];
}

export default function TablaRevisandoPhone({ datos }: TablaRevisandoProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border-separate border-spacing-y-2 animate-fade-in-up">
        <tbody>
          {datos.map((entry) => (
            <tr key={entry.candidateUID} onClick={() => 
                      router.push(
                        `/dashboard/${entry.candidateUID}?from=${encodeURIComponent(pathname)}`
                      )
                    } className="cursor-pointer">
                <td className="bg-white rounded-l-xl p-4">
                    <ProfilePicture
                        nombre={`${entry.nombre || ""}`}
                        width="w-12"
                        height="h-12"
                        textSize="text-2xl"
                    />
                </td>
                <td className="bg-white p-4">
                    <p className="font-semibold text-xl">{entry.nombre} {entry.apellidos}</p>
                    <p className="text-xs">{entry.email}</p>
                </td>
                <td className="bg-white rounded-r-xl p-4">
                  <button className="cursor-pointer">
                    <ArrowUpRight className="size-4.5"/>
                  </button>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}