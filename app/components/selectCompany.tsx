"use client";

import {useState, useEffect} from "react";
import {ref, get} from "firebase/database";
import {database} from "@/firebaseConfig";
import {urbanist} from "./fonts";

export interface Company {
    id: string;
    nombre: string;
}

export interface SelectCompanyProps {
    uid: string,
    onSelect: (companyId: string | null) => void;
    disabled?: boolean;
}

export default function SelectCompany({
    onSelect,
    disabled = false,
}: SelectCompanyProps) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");

    useEffect(() => {
        async function fetchCompanies() {
            const snap = await get(ref(database, "contratos/empresas"));
            if (snap.exists()) {
                const data = snap.val();
                setCompanies(
                    Object.keys(data).map((key) => ({
                        id: key,
                        nombre: data[key].nombre,
                    }))
                );
            }
        }
        fetchCompanies();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedId(id);
        onSelect(id || null);
    };

    return (
        <div>
            <div className={`${urbanist.className} text-[#212529] text-xl font-semibold`}>
                <label htmlFor="selectCompany">Empresa</label>
            </div>
            <select
                id="selectCompany"
                value={selectedId}
                onChange={handleChange}
                disabled={disabled}
                className="w-full p-1 border rounded-lg mt-6 border-gray-300"
            >
                <option value="">Elige la empresa</option>
                {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.nombre}
                    </option>
                ))}
            </select>
        </div>
    );
}