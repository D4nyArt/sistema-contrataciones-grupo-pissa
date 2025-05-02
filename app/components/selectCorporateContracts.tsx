"use client";

import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "@/firebaseConfig";
import { urbanist } from "./fonts";

export interface Contract {
  id: string;
  name: string;
  url: string;
}

export interface SelectCorporateContractsProps {
  uid: string;
  onSelect: (contract: Contract | null) => void;
  disabled?: boolean;
}

export default function SelectCorporateContracts({
  onSelect,
  disabled = false,
}: SelectCorporateContractsProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  // Obtiene todos los contratos corporativos de la base de datos
  useEffect(() => {
    async function fetchContracts() {
      const snap = await get(ref(database, "contratos/corporativo"));
      if (snap.exists()) {
        const data = snap.val();
        setContracts(
          Object.keys(data).map((key) => ({
            id: key,
            name: data[key].name,
            url: data[key].url,
          }))
        );
      }
    }
    fetchContracts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedId(id);
    const found = contracts.find((c) => c.id === id) ?? null;
    onSelect(found);
  };

  return (
    <div>
      <div className={`${urbanist.className} text-[#212529] text-xl font-semibold`}>
        <label htmlFor="selectCorp">Contrato</label> 
      </div>
      <select
        id="selectCorp"
        value={selectedId}
        onChange={handleChange}
        disabled={disabled}
        className="w-full p-1 border rounded-lg mt-6 border-gray-300 "
      >
        {/*Esto despliega el nombre de cada contrato en el select*/}
        <option value="">Elige el contrato</option>
        {contracts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
