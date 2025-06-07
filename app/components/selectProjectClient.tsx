"use client";

import { useState, useEffect } from "react";
import { ref, get } from "firebase/database";
import { database } from "@/firebaseConfig";
import { urbanist } from "./fonts";

export interface Client {
    id: string;
    nombre: string;
}

export interface SelectProjectClientProps {
    uid: string;
    onSelect: (clientId: string | null) => void;
    disabled?: boolean;
}

export default function SelectProjectClient({
    onSelect,
    disabled = false,
}: SelectProjectClientProps) {
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");

    useEffect(() => {
        async function fetchClients() {
            const snap = await get(ref(database, "contratos/proyectos/clientes"));
            if (snap.exists()) {
                const data = snap.val();
                setClients(
                    Object.keys(data).map((key) => ({
                        id: key,
                        nombre: data[key].nombre,
                    }))
                );
            }
        }
        fetchClients();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setSelectedId(id);
        onSelect(id || null);
    };

    return (
        <div>
            <div className={`${urbanist.className} text-[#212529] text-xl font-semibold`}>
                <label htmlFor="selectClient">Cliente</label>
            </div>
            <select
                id="selectClient"
                value={selectedId}
                onChange={handleChange}
                disabled={disabled}
                className="w-full p-1 border rounded-lg mt-6 border-gray-300"
            >
                <option value="">Elige el cliente</option>
                {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                        {c.nombre}
                    </option>
                ))}
            </select>
        </div>
    );
}