import Image from 'next/image';
import { urbanist } from '@/app/components/fonts';
import Questions from '../components/questions';
import BotonRegresar from "../components/botonRegresar";

export default function FAQPage() {
  return(
    <div className="h-screen flex-col md:flex-col md:bg-none">
        <div className="mt-14 ml-78 absolute hover:text-[#08b177] text-white">
            <BotonRegresar />
        </div>
        <div className="h-1/3 w-full flex items-center justify-center rounded-b-4xl bg-[url(/fondo.jpg)] bg-cover bg-center">
            <div className="mb-25">
                <Image
                    width={200}
                    height={65}
                    alt="Logo Grupo Pissa"
                    src="/logo-blanco.png"
                />
            </div>
        </div>
        <div className="h-2/3 w-full bg-white flex items-start justify-center">
            <div className="mt-10 text-center">
            <h1 className={`text-[#001e2b] text-3xl md:text-4xl pb-2 ${urbanist.className}`}><strong>Preguntas frecuentes</strong></h1>
            <Questions />
            </div>
        </div>
      </div>
  )
}
