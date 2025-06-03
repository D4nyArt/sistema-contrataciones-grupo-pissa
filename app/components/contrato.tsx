"use client";
import React, { useEffect, useState } from "react";
import { database } from "../../firebaseConfig";
import { ref, get } from "firebase/database";
import { urbanist } from "./fonts";
import BotonRegresar from "./botonRegresar";

export default function Contratos({ id }: { id: string }) {
  // const router = useRouter();

  // const searchparams = useSearchParams();
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = ref(database, `contratos/proyectos/${id}`);
        const snapshot = await get(userRef);
        let data = snapshot.val() || {};

        //if the contract is not in "proyectos" search in "corporativo"
        if (!Object.keys(data).length) {
          const userRef = ref(database, `contratos/corporativo/${id}`);
          const snapshot = await get(userRef);
          data = snapshot.val() || {};
        }

        setName(data.name || "");
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, [id]);

  return (
    <div>
      <div className="mb-8 animate-fade-in-up hover:text-[#08b177] text-[#495057]">
        <BotonRegresar />
      </div>
      <div className="flex flex-col md:flex-row items-center {/*border-b border-gray-300*/} pb-6 animate-fade-in-up">
        <h1 className={`${urbanist.className} text-4xl text-[#212529]`}>
          <strong>{name || "Nombre del contrato"}</strong>
        </h1>
      </div>
    </div>
  );
}
