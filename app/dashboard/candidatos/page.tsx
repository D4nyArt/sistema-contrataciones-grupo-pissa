import { urbanist } from "@/app/components/fonts";
import ListUsers from "@/app/components/lista-candidatos";

export default function Candidatos() {
  return (
    <>
      <h1 className={`${urbanist.className} text-4xl text-[#212529] pl-4 mb-4`}>
        <strong>Candidatos</strong>
      </h1>
      <ListUsers />
    </>
  );
}
