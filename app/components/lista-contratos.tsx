"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EllipsisVertical, FileText, LayoutGrid, Plus, Table2 } from "lucide-react";
import { urbanist } from "./fonts";

interface Contract {
  id?: string;
  name?: string;
  url?: string;

}

const ContractCard = ({ contract }: { contract: Contract }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullPath = `${pathname}?${searchParams.toString()}`;

  return (
    <div
      onClick={() => router.push(`/dashboard/contratos/${contract.id}?from=${encodeURIComponent(fullPath)}`)}
      className="cursor-pointer p-4 bg-white rounded-xl shadow-md transition-transform transform hover:scale-105 flex flex-col animate-fade-in-up"
    >
      <div className="flex flex-row">
        <EllipsisVertical className="ml-auto text-[#495057]"/>
      </div>
      <div className="flex flex-col justify-between items-center">
        <FileText className="text-[#2d4583] size-20"/>
        <div
          className={`${urbanist.className} text-lg font-semibold text-black flex-auto mt-4 text-center`}
        >
          {contract.name || "N/A"}
        </div>
        <div className="mb-4">
          <p className="text-[#495057]">Proyecto</p>
        </div>
      </div>
    </div>
  );
};

export default function ListContracts() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [sortOption, setSortOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activo, setActivo] = useState<"grid" | "tabla">("grid");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/getContracts");
        const data = await res.json();
        setContracts(data);
      } catch (err) {
        console.error("Error al cargar contratos", err);
      }
    };
    fetchUsers();
  }, []);

  const filtrarContratos = contracts.filter((contract) => {
    const buscar = searchTerm.toLowerCase();
  
    return (
        contract.name?.toLowerCase().includes(buscar)
    );
  });

  const sortedContratos = sortOption
    ? [...filtrarContratos].sort((a, b) => {
        let prop: keyof Contract = "name";
  
        const textA = (a[prop] || "").toLowerCase();
        const textB = (b[prop] || "").toLowerCase();
  
        return sortOption.includes("ZA")
          ? textB.localeCompare(textA)
          : textA.localeCompare(textB);
      })
    : filtrarContratos;

  return (
    <main className="flex-1 p-4">
      <div className="mb-4 flex gap-6 text-black animate-fade-in-up">
        {/*<label>Ordenar por:</label>*/}
        <input
          type="text"
          placeholder="Buscar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border border-gray-400 rounded-lg w-full bg-white"
        />
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="cursor-pointer border border-gray-400 p-1 pl-4 rounded-lg bg-white text-[#495057] hover:bg-[#08b177] hover:text-white"
        >
          <option value="">Ordenar por</option>
          <option value="nombreAZ">Nombre A → Z</option>
          <option value="nombreZA">Nombre Z → A</option>
        </select>
        <button
          value={sortOption}
          onClick={() => router.push("/dashboard/contratos/nuevo_contrato")}
          className="cursor-pointer border p-1 gap-2 rounded-lg bg-[#2d4583] text-white hover:bg-[#08b177] w-70 inline-flex justify-center items-center"
        >
          <Plus/>
          Nuevo Contrato
        </button>
        <div className="md:flex shadow-md bg-white rounded-l-lg rounded-r-lg hidden text-[#495057]">
          <button
            onClick={() => setActivo("grid")}
            className={`cursor-pointer rounded-lg  p-1 pl-2 pr-2 transition-colors border ${
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

      {activo === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-5 gap-4 content-center">
          {sortedContratos.map((contract) => (
            <ContractCard key={contract.name} contract={contract} />
          ))}
        </div>
      )}

      {activo === "tabla" && (
        <div>
          <table className="table-auto w-full border-separate border-spacing-y-2 animate-fade-in-up">
            <thead>
              <tr className="shadow-xs rounded-xl">
                <th className="px-4 py-4 text-start text-[#495057] font-normal bg-white rounded-l-xl">
                  Nombre
                </th>
                <th className="px-4 py-4 text-start text-[#495057] font-normal bg-white">
                  Tipo
                </th>
                <th className="px-4 py-4 text-start text-[#495057] font-normal bg-white">
                  Fecha de creación
                </th>
                <th className="px-4 py-4 text-start text-[#495057] font-normal bg-white rounded-r-xl">
                  Tamaño
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedContratos.length === 0 ? (
                <tr>
                  <td
                    className="border-b border-gray-300 px-4 py-4 text-center bg-white rounded-xl"
                    colSpan={6}
                  >
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                sortedContratos.map((contract) => (
                  <tr key={contract.name}>
                    <td className="font-semibold px-4 py-4 bg-white rounded-l-xl flex flex-row items-center gap-2">
                      <FileText className="text-[#2d4583]"/>
                      {contract.name || "N/A"}
                    </td>
                    <td className="px-4 py-4 bg-white">
                      <div className="bg-blue-100 text-blue-800 rounded-lg text-center">
                        Proyecto
                      </div>
                    </td>
                    <td className="px-4 py-4 bg-white">
                      10/05/2025 10:00 pm
                    </td>
                    <td className="px-4 py-4 bg-white rounded-r-xl">
                      10 MB
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
