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
        console.log(`contratos/corporativo/${id}`);
        const userRef = ref(database, `contratos/proyectos/${id}`);
        const snapshot = await get(userRef);
        let data = snapshot.val() || {};

        //if the contract is not in "proyectos" search in "corporativo"
        if (!Object.keys(data).length) {
          const userRef = ref(database, `contratos/corporativo/${id}`);
          const snapshot = await get(userRef);
          data = snapshot.val() || {};
        }

        console.log(data);
        setName(data.name || "");
      } catch (e) {
        console.error(e);
      }
    };
    fetchUser();
  }, [id]);

  return (
    <div>
      <div className="mb-8">
        <BotonRegresar />
      </div>
      <div className="flex flex-col md:flex-row items-center {/*border-b border-gray-300*/} pb-6">
        <h1 className={`${urbanist.className} text-4xl text-[#212529]`}>
          <strong>{name || "Nombre del contrato"}</strong>
        </h1>
      </div>
    </div>
  );
}
