"use client";

import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "@/firebaseConfig";

export interface Contract {
  id: string;
  name: string; // actual pdf file name, e.g. "mi-contrato.pdf"
  url: string;
}

export interface SelectProjectContractsProps {
  uid: string;
  onSelect: (contract: Contract | null) => void;
  disabled?: boolean;
}

// TODO quitar el uid y todo lo que dependa de el por el id del contrato
export default function SelectProjectContracts({
  onSelect,
  disabled = false,
}: SelectProjectContractsProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  // Obtiene todos los contratos de proyecto de la base de datos
  useEffect(() => {
    async function fetchContracts() {
      const snap = await get(ref(database, "contratos/proyectos"));
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
      <label htmlFor="selectProject">Contrato de proyecto:</label>
      <select
        id="selectProject"
        value={selectedId}
        onChange={handleChange}
        disabled={disabled}
        className="w-full p-1 border rounded"
      >
        {/*Esto despliega el nombre de todos los contratos en el select*/}
        <option value="">-- Elige --</option>
        {contracts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
