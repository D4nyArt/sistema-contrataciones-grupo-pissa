import { cookies } from "next/headers";
import SelectCandidateTab from "@/app/components/selectCandidateTabs";

export default async function UserInformation() {
  const candidateCookies = await cookies();
  const userID = candidateCookies.get("candidateId")?.value || "";

  return <SelectCandidateTab userID={userID} />;
}
