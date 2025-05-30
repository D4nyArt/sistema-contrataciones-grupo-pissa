import EstablecerContrasenaLink from "../../components/establecerContrasenaLink";
import Image from "next/image";
import FondoBlanco from "../../components/fondo-blanco";

export default function EstablecerLink() {
  return (
    <div className="bg-[#2d4583] md:bg-white h-screen p-8 md:justify-around md:flex">
      <div className="md:justify-center md:items-center md:flex md:absolute">
        <Image
          width={50}
          height={50}
          alt="Logo Pissa"
          src="/icono-blanco.png"
          className="pb-10 block md:hidden"
        />
      </div>
      <div className="block md:hidden">
        <FondoBlanco>

          <EstablecerContrasenaLink></EstablecerContrasenaLink>
        </FondoBlanco>
      </div>
      <div className="hidden md:flex md:justify-center md:items-center w-1/2 flex-col">
        <div className="md:justify-around md:m-40">
          <Image
            width={150}
            height={100}
            alt="Logo Pissa"
            src="/logo_pissa.png"
            className="pb-10 hidden md:block"
          />
        
          <EstablecerContrasenaLink></EstablecerContrasenaLink>
        </div>
      </div>
      <div className="hidden md:flex md:justify-start md:items-center md:rounded-4xl bg-[url(/personas.png)] w-3/5 h-full md:bg-cover md:bg-center"></div>
    </div>
  );
}
