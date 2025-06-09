"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../../firebaseConfig";
import { getDatabase, ref, get } from "firebase/database";

import ListInformation from "@/app/components/usuario-phone";
import Usuarios from "@/app/components/usuario";
import ExpedienteRH from "@/app/components/expedienteRH";
import ContractsPage from "@/app/components/contractsPage";
import InfoPerfil from "./informacionPerfil";
import History from "./history/history";
import SkeletonUserInfo from "./skeletonUserInfo";

type Tab = "información" | "expediente" | "contratos" | "histórico";

export default function UserInfo({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;

  const [role, setRole] = useState<string | null>(null);
  const [active, setActive] = useState<Tab>("información");

  // 1) Leer rol al montar
  useEffect(() => {
    async function fetchRole() {
      try {
        const db = getDatabase();
        const snap = await get(ref(db, `usuarios/${id}/rol`));
        setRole(snap.exists() ? snap.val() : null);
      } catch {
        setRole(null);
      }
    }
    fetchRole();
  }, [id]);

  // 2) Sincronizar pestaña con URL y forzar sólo "información" si RH
  useEffect(() => {
    if (role === "rh") {
      setActive("información");
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "información");
      router.replace(`?${params.toString()}`);
    } else if (
      tabParam === "información" ||
      tabParam === "expediente" ||
      tabParam === "contratos" ||
      tabParam === "histórico"
    ) {
      setActive(tabParam);
    }
  }, [role, tabParam, router, searchParams]);

  const handleTabChange = (tab: Tab) => {
    if (role === "rh" && tab !== "información") return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
    setActive(tab);
  };

  if (role === null) return <div><div className="hidden md:block"><SkeletonUserInfo/></div></div>;

  return (
    <div className="h-screen flex flex-col">
      <div className="hidden md:block">
        <Usuarios />
      </div>
      <div className="block md:hidden">
        <ListInformation />
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-300 mb-4 overflow-x-auto">
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
            <button
              onClick={() => handleTabChange("histórico")}
              className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
                active === "histórico"
                  ? "border-[#2d4583] text-[#2d4583]"
                  : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
              }`}
            >
              Histórico
            </button>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {active === "información" && <InfoPerfil />}
        {active === "expediente" && role !== "rh" && <ExpedienteRH userId={id} />}
        {active === "contratos" && role !== "rh" && <ContractsPage uid={id} />}
        {active === "histórico" && role !== "rh" && <History />}
      </div>
    </div>
  );
}