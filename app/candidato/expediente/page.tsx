import { cookies } from "next/headers"; //Cookie del lado del servidor; todo lo que tiene que ver con headers es del servidor 
import ExpedienteCandidato from "@/app/components/expedienteCandidato";

export default async function UserInformation() {
  const candidateCookies = await cookies();
  const userID = candidateCookies.get("candidateId")?.value;
  return (
    <>
      <ExpedienteCandidato
        // userId={"JAT469lLXCZi8wi4dcq9xzNoVSu1"}
        userId={userID}
        role="candidate"
      />
    </>
  );
}
