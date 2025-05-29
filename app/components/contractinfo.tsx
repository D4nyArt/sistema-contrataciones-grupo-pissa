"use client";
import ListInformation from "@/app/components/usuario-phone";
import React, { useState } from "react";
import Contratos from "./contrato";
import AdminContractsPage from "./admincon";
import { usePathname } from "next/navigation";
import AdminOnboardingPage from "./admonbcard";

export default function ContractInfo({ id }: { id: string }) {
  
  const pathname = usePathname();
  const _id = pathname.split("/")[3];
  
  const [active, setActive] = useState<"onboarding" | "contratos">(
    "contratos"
  );

  return (
    <div>
      <div className="hidden md:block">
        <Contratos id = {_id}/>
      </div>
      <div className="block md:hidden">
        <ListInformation/>
      </div>

      <div className="">
        <div className="space-x-6 border-b border-gray-300 items-center mb-6">
          
          <button
            onClick={() => setActive("contratos")}
            className={`cursor-pointer pb-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
              active === "contratos"
                ? "border-[#2d4583] text-[#2d4583]"
                : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
            }`}
          >
            Información de Contrato
          </button> 
          
          <button
            onClick={() => setActive("onboarding")}
            className={`cursor-pointer pb-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
              active === "onboarding"
                ? "border-[#2d4583] text-[#2d4583]"
                : "border-transparent text-gray-500 hover:text-[#08b177] hover:border-[#08b177]"
            }`}
          >
            Onboarding
          </button>

          
        </div>

        { active === "contratos" && <AdminContractsPage uid={_id} /> }
        { active === "onboarding" && (
          <AdminOnboardingPage contractid={_id}/>
        ) }
      </div>
    </div>
  );
}