"use client";

import { LayoutGrid, Table2 } from "lucide-react";

interface UserMenuProps {
  searchTerm: string;
  sortOption: string;
  activo: "grid" | "tabla";
  setSearchTerm: (term: string) => void;
  setSortOption: (option: string) => void;
  setActivo: (mode: "grid" | "tabla") => void;
}

export default function UserMenu({
  searchTerm,
  sortOption,
  activo,
  setSearchTerm,
  setSortOption,
  setActivo,
}: UserMenuProps) {
  return (
    <div className="mb-4 flex gap-6 text-black animate-fade-in-up">
        <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border border-gray-400 rounded-lg w-full bg-white appearance-none outline-amber-700"
        />
        <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="cursor-pointer border p-1 pl-4 rounded-lg bg-[#2d4583] text-white hover:bg-[#08b177]"
        >
            <option value="">Ordenar por</option>
            <option value="nombreAZ">Nombre A → Z</option>
            <option value="nombreZA">Nombre Z → A</option>
            <option value="apellidoAZ">Apellido A → Z</option>
            <option value="apellidoZA">Apellido Z → A</option>
        </select>
        <div className="md:flex shadow-md bg-white rounded-l-lg rounded-r-lg hidden text-[#495057]">
            <button
                onClick={() => setActivo("grid")}
                className={`cursor-pointer rounded-lg p-1 pl-2 pr-2 transition-colors border ${
                    activo === "grid"
                    ? "border-[#2d4583] text-[#2d4583]"
                    : "border-transparent hover:text-[#08b177]"
                }`}
            >
                <LayoutGrid />
            </button>
            <button
                onClick={() => setActivo("tabla")}
                className={`cursor-pointer rounded-lg p-1 pl-2 pr-2 transition-colors border ${
                    activo === "tabla"
                    ? "border-[#2d4583] text-[#2d4583]"
                    : "border-transparent hover:text-[#08b177]"
                }`}
            >
                <Table2 />
            </button>
        </div>
    </div>
  );
}