import { urbanist } from "@/app/components/fonts";
import ListContracts from "@/app/components/lista-contratos";
export default function Contracts() {
  return (
    <>
      <h1 className={`${urbanist.className} text-4xl text-[#212529] pl-4 mb-4 animate-fade-in-up`}>
        <strong>Contratos</strong>
      </h1>
      <ListContracts/>
    </>
  );
}
