import Image from 'next/image';
import Formulario from "@/app/components/form-login";
import { urbanist } from '@/app/components/fonts';
import { LoginFAQ } from '@/app/components/faq';

export default function Home() {
  return(
    <div className="h-screen flex flex-wrap md:flex-nowrap bg-[url(/fondo.jpg)] bg-cover bg-center md:bg-none">
      <div className="flex w-full items-center justify-around md:hidden h-2/5 rounded-b-4xl md:rounded-lg">
        <Image
          width={200}
          height={50}
          alt="Logo Grupo Pissa"
          src="/logo-blanco.png"
        />
      </div>
      <div className="block md:flex w-full md:w-1/2 items-center justify-center h-3/5 md:p-25 p-8 md:h-full bg-white rounded-t-4xl md:rounded-none">
        <div className="p-0 md:p-4 md:pl-0 md:pr-0">
          <h1 className={`text-[#001e2b] text-3xl md:text-4xl pb-2 ${urbanist.className}`}><strong>Te damos la bienvenida a Grupo Pissa</strong></h1>
          <h1 className="text-[#001e2b] pb-8 md:pb-15 antialiased">Inicia sesión para continuar.</h1>
          <Formulario></Formulario>
        </div>
      </div>
      <div className="hidden w-full md:w-min-3/5 items-center justify-center h-1/2 md:h-full md:flex rounded-s-4xl md:bg-[url(/fondo.jpg)] md:bg-cover md:bg-center">
        <div>
          <Image
            width={400}
            height={100}
            alt="Logo Grupo Pissa"
            src="/logo-blanco.png"
          />
        </div>
      </div>
      <LoginFAQ />
    </div>
  )
}
