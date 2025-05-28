import { urbanist } from "@/app/components/fonts";
import ListUsers from "@/app/components/recoverAccount";

export default function recoverAccount() {
  return (
    <>
      <h1 className={`${urbanist.className} text-4xl text-[#212529] pl-4 mb-4 animate-fade-in-up`}>
        <strong>Recuperación de Contraseñas</strong>
      </h1>
      <ListUsers />
    </>
  );
}
