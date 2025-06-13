/**
 * personas/page.tsx
 *
 * Proporciona la página principal de gestión de personas del sistema con navegación por pestañas.
 *
 * Esta página del dashboard administrativo presenta una interfaz completa para la
 * gestión de personal del sistema mediante un sistema de pestañas que permite alternar
 * entre empleados y personal de Recursos Humanos. Incluye título prominente con
 * tipografía corporativa, navegación por pestañas sincronizada con parámetros de URL
 * y renderizado condicional de componentes especializados según la categoría seleccionada.
 * Optimizada para uso administrativo en la supervisión integral del personal.
 */

"use client";

import { useEffect, useState } from "react";
import ListRecursos from "../../components/lista-rh";
import { urbanist } from "../../components/fonts";
import ListEmpleados from "@/app/components/lista-general";
import { useRouter, useSearchParams } from "next/navigation";

export default function VistaUsuarios() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const [activo, setActivo] = useState<"empleados" | "recursos humanos">(
    "empleados"
  );

  useEffect(() => {
    if (tabParam === "recursos humanos" || tabParam === "empleados") {
      setActivo(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: "empleados" | "recursos humanos") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
    setActivo(tab);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-4 md:mt-0">
      <h1
        className={`${urbanist.className} text-4xl text-[#212529] pl-4 mb-4 animate-fade-in-up`}
      >
        <strong>Personas</strong>
      </h1>

      <div className="flex space-x-6 border-b border-gray-300 items-center ml-4 animate-fade-in-up">
        <button
          onClick={() => handleTabChange("empleados")}
          className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
            activo === "empleados"
              ? "border-[#2d4583] text-[#2d4583]"
              : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
          }`}
        >
          Empleados
        </button>

        <button
          onClick={() => handleTabChange("recursos humanos")}
          className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
            activo === "recursos humanos"
              ? "border-[#2d4583] text-[#2d4583]"
              : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
          }`}
        >
          Recursos Humanos
        </button>
      </div>

      {activo === "recursos humanos" && <ListRecursos />}
      {activo === "empleados" && <ListEmpleados />}
    </div>
  );
}
