/**
 * candidato/expediente/page.tsx
 *
 * Componente de página principal del expediente del candidato.
 *
 * Esta página permite a los candidatos visualizar y gestionar su expediente
 * personal completo, incluyendo documentos subidos, información personal,
 * estado de revisión y comunicaciones con el equipo de RH. Actúa como
 * hub central para todas las actividades relacionadas con el proceso
 * de contratación desde la perspectiva del candidato.
 */

import { cookies } from "next/headers";
import SelectCandidateTab from "@/app/components/selectCandidateTabs";
import { urbanist } from "@/app/components/fonts";

export default async function UserInformation() {
  const candidateCookies = await cookies();
  const userID = candidateCookies.get("candidateId")?.value || "";

  return (
    <>
      <h1
        className={`${urbanist.className} font-bold text-4xl mb-6 text-[#212529]`}
      >
        Expediente
      </h1>
      <SelectCandidateTab userID={userID} />
    </>
  );
}
