import CreateCredentials from "@/app/components/createcredentials";
import { urbanist } from "@/app/components/fonts";

export default function Credentials() {
  return (
    <div className="overflow-y-auto p-4 md:mt-0 flex-col flex">
      <h1 className={`${urbanist.className} text-4xl text-[#212529] pl-4 mb-4`}>
        <strong>Creación de Credenciales</strong>
      </h1>
      <CreateCredentials />
    </div>
  );
}
