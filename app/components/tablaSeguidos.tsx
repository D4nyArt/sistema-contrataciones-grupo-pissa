"use client";

import React from "react";
import ProfilePicture from "./profile-picture";
import EtiquetaEstado from "./etiquetaEstado";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function TablaRevisando({ datos }: TablaRevisandoProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full border-separate border-spacing-y-2 animate-fade-in-up">
        <thead>
          <tr>
            <th className="py-4"></th>
            <th className="px-4 py-4 text-start text-[#495057] font-normal text-sm">Nombre</th>
            <th className="px-4 py-4 text-start text-[#495057] font-normal text-sm">Email</th>
            <th className="px-4 py-4 text-start text-[#495057] font-normal text-sm">Desde</th>
            <th className="px-4 py-4 text-start text-[#495057] font-normal text-sm">Estado</th>
            <th className="px-4 py-4"></th>
          </tr>
        </thead>
        <tbody>
          {datos.map((entry) => (
            <tr key={entry.candidateUID}>
                <td className=" py-2 border-b border-gray-300">
                    <ProfilePicture
                        nombre={`${entry.nombre || ""}`}
                        width="w-8"
                        height="h-8"
                        textSize="text-xl"
                    />
                </td>
                <td className="px-4 py-4 border-b border-gray-300">{entry.nombre} {entry.apellidos}</td>
                <td className="px-4 py-4 border-b border-gray-300">{entry.email}</td>
                <td className="px-4 py-4 border-b border-gray-300">
                  {new Date(entry.since).toLocaleString("es-MX", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-4 border-b border-gray-300"><EtiquetaEstado status={entry.estadoUsuario}/></td>
                <td className="px-4 py-4 border-b border-gray-300">
                  <button onClick={() => router.push(`/dashboard/${entry.candidateUID}`)} className="cursor-pointer">
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