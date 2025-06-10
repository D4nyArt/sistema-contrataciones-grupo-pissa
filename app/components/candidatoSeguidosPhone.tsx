"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { urbanist } from "./fonts";
import TablaRevisandoPhone from "./tablaSeguidosPhone";
import SeguidosSkeleton from "./tablaSeguidosSkeleton";

export default function RevisandoListPhone () {
    interface RevisandoEntry {
    candidateUID: string;
    since: string;
    nombre: string;
    apellidos: string;
    estadoUsuario: string;
    email: string;
    }
    
    const [revisando, setRevisando] = useState<RevisandoEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
            setUser(firebaseUser);
        } else {
            setError("Usuario no autenticado.");
            setLoading(false);
        }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user) return;
    
        fetch(`/api/getFollowed?rhUID=${user.uid}`)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setRevisando(data);
            } else {
              setError(data?.error || "Error desconocido");
            }
          })
          .catch((err) => setError("Error de red: " + err.message))
          .finally(() => setLoading(false));
      }, [user]);
    

      if (loading) return <SeguidosSkeleton/>;
      if (error) return <p>Error: {error}</p>;
      if (revisando.length === 0) return <div className="flex flex-col h-full"><h2 className={`${urbanist.className} text-[#212529] font-bold text-2xl mb-4`}>
        Candidatos en revisión
      </h2><p className="flex justify-center items-center w-full h-full">No hay candidatos en revisión.</p>
      </div>;

    return(
        <>
            <h2 className={`${urbanist.className} text-[#212529] font-bold text-2xl mb-4 animate-fade-in-up`}>
                    Candidatos en revisión
            </h2>
            <TablaRevisandoPhone datos={revisando}/>
        </>
    )
}