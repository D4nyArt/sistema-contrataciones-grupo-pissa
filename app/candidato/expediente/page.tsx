import { cookies } from "next/headers";
import SelectCandidateTab from "@/app/components/selectCandidateTabs";
import { urbanist } from "@/app/components/fonts";

export default async function UserInformation() {
  const candidateCookies = await cookies();
  const userID = candidateCookies.get("candidateId")?.value || "";

  return(
    <>
      <h1 className={`${urbanist.className} font-bold text-4xl mb-6`}>Expediente</h1>
      <SelectCandidateTab userID={userID} />
    </>
  );
}
