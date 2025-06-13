/**
 * faq/page.tsx
 *
 * Proporciona la página de preguntas frecuentes (FAQ) del sistema de contrataciones.
 *
 * Esta página presenta una interfaz completa de preguntas frecuentes con funcionalidades
 * de búsqueda avanzada y diseño corporativo. Implementa un layout visual dividido con
 * sección superior de imagen de fondo corporativa que incluye logotipo prominente y
 * barra de búsqueda integrada, seguida de sección inferior con listado de preguntas
 * filtrable en tiempo real. Optimizada para proporcionar acceso rápido y eficiente
 * a información de ayuda y soporte para usuarios del sistema.
 */

"use client";

import Image from "next/image";
import { useState } from "react";
import { urbanist } from "@/app/components/fonts";
import Questions from "../components/questions";
import BotonRegresar from "../components/botonRegresar";
import SearchBar from "../components/searchBar";

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="h-screen flex-col md:flex-col md:bg-none">
      <div className="m-5 md:mt-14 md:ml-78 absolute hover:text-[#08b177] text-white">
        <BotonRegresar />
      </div>
      <div className="h-1/3 w-full flex items-center justify-center rounded-b-4xl bg-[url(/fondo.jpg)] bg-cover bg-center">
        <div className="mb-15 md:mb-25">
          <Image
            width={200}
            height={65}
            alt="Logo Grupo Pissa"
            src="/logo-blanco.png"
          />
        </div>
        <div className="absolute w-70 md:w-222 mt-30 md:mt-20">
          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </div>
      <div className="h-2/3 w-full bg-white flex items-start justify-center">
        <div className="mt-10 text-center">
          <h1
            className={`text-[#001e2b] text-3xl md:text-4xl pb-2 ${urbanist.className}`}
          >
            <strong>Preguntas frecuentes</strong>
          </h1>
          <Questions searchTerm={searchTerm} />
        </div>
      </div>
    </div>
  );
}
