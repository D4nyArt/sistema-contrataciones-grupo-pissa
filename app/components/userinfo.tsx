"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
// Asegúrate de que tu firebaseConfig inicializa la app
import "../../firebaseConfig";
import { getDatabase, ref, get } from "firebase/database";

import ListInformation from "@/app/components/usuario-phone";
import Usuarios from "@/app/components/usuario";
import ExpedienteRH from "@/app/components/expedienteRH";
import ContractsPage from "@/app/components/contractsPage";
import InfoPerfil from "./informacionPerfil";

export default function UserInfo({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [active, setActive] = useState<"información" | "expediente" | "contratos">(
    "información"
  );
  const [role, setRole] = useState<string | null>(null);

  // 1) Fetch del rol al montar
  useEffect(() => {
    async function fetchRole() {
      try {
        const db = getDatabase();
        const snap = await get(ref(db, `usuarios/${id}/rol`));
        if (snap.exists()) setRole(snap.val());
        else setRole(null);
      } catch (err) {
        console.error("Error al leer rol:", err);
        setRole(null);
      }
    }
    fetchRole();
  }, [id]);

  // 2) Sincronizar tab con URL y forzar "información" si es RH
  useEffect(() => {
    if (role === "rh") {
      setActive("información");
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "información");
      router.replace(`?${params.toString()}`);
      return;
    }
    if (tabParam === "información" || tabParam === "expediente" || tabParam === "contratos") {
      setActive(tabParam);
    }
  }, [tabParam, role, router, searchParams]);

  const handleTabChange = (tab: "información" | "expediente" | "contratos") => {
    if (role === "rh" && tab !== "información") return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
    setActive(tab);
  };

  if (role === null) {
    // Mientras carga el rol
    return <div>Cargando perfil…</div>;
  }

  return (
    <div>
      <div className="hidden md:block">
        <Usuarios />
      </div>
      <div className="block md:hidden">
        <ListInformation />
      </div>
      <div className="space-x-6 items-center">
        <div className="space-x-6 border-b border-gray-300 items-center mb-6">
          {/* Siempre: Información */}
          <button
            onClick={() => handleTabChange("información")}
            className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
              active === "información"
                ? "border-[#2d4583] text-[#2d4583]"
                : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
            }`}
          >
            Información
          </button>

          {/* Sólo si no es RH */}
          {role !== "rh" && (
            <>
              <button
                onClick={() => handleTabChange("expediente")}
                className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
                  active === "expediente"
                    ? "border-[#2d4583] text-[#2d4583]"
                    : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
                }`}
              >
                Expediente
              </button>
              <button
                onClick={() => handleTabChange("contratos")}
                className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
                  active === "contratos"
                    ? "border-[#2d4583] text-[#2d4583]"
                    : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
                }`}
              >
                Contratos
              </button>
            </>
          )}
        </div>

        {/* Contenido de cada pestaña */}
        {active === "información" && <InfoPerfil />}
        {active === "expediente" && role !== "rh" && <ExpedienteRH userId={id} />}
        {active === "contratos" && role !== "rh" && <ContractsPage uid={id} />}
      </div>
    </div>
  );
}