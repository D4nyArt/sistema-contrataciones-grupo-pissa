"use client";

import React, { useEffect, useState } from "react";
import Contratos from "./contrato";
import AdminContractsPage from "./admincon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
//import AdminOnboardingPage from "./admonbcard";

export default function ContractInfo() {
  
  const pathname = usePathname();
  const _id = pathname.split("/")[3];
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  const [active, setActive] = useState<"onboarding" | "contratos">("contratos");

  useEffect(() => {
    if (tabParam === "onboarding" || tabParam === "contratos") {
      setActive(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tab: "onboarding" | "contratos") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`);
    setActive(tab);
  }

  return (
    <div>
      <div className="flex">
        <Contratos id = {_id}/>
      </div>

      <div>
        <div className="space-x-6 border-b border-gray-300 items-center mb-6 animate-fade-in-up">
          
          <button
            onClick={() => handleTabChange("contratos")}
            className={`cursor-pointer pb-2 font-medium transition-colors duration-200 border-b-2 ${
              active === "contratos"
                ? "border-[#2d4583] text-[#2d4583]"
                : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
            }`}
          >
            Información de Contrato
          </button> 
          

          
        </div>

        { active === "contratos" && <AdminContractsPage uid={_id} /> }
        {
        //Maybe useful later
        /*{ active === "onboarding" && (
          <AdminOnboardingPage contractid={_id}/>
        ) }*/}
      </div>
    </div>
  );
}