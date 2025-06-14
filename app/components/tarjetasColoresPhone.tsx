/**
 * tarjetasColoresPhone.tsx
 *
 * Proporciona un conjunto de tarjetas informativas optimizadas para dispositivos móviles.
 *
 * Este componente renderiza una versión móvil de las tarjetas de proceso que guían a los
 * candidatos a través del flujo de incorporación. Implementa scroll horizontal para
 * acomodar las tarjetas en pantallas pequeñas manteniendo la funcionalidad completa
 * y efectos interactivos. Cada tarjeta conserva la iconografía distintiva, colores
 * únicos y navegación directa optimizada para dispositivos táctiles.
 */

import { Archive, FileUser, Handshake } from "lucide-react";
import Link from "next/link";

/**
 * Renderiza tarjetas de proceso con scroll horizontal optimizadas para móviles.
 *
 * Este componente proporciona una interfaz adaptada para dispositivos móviles que
 * mantiene toda la funcionalidad de las tarjetas de proceso en un formato optimizado
 * para pantallas pequeñas. Implementa scroll horizontal fluido para permitir navegación
 * táctil entre las tres tarjetas del proceso: expediente, contratos y onboarding.
 * Las tarjetas mantienen dimensiones fijas para consistencia visual y incluyen efectos
 * de hover adaptados para interacciones táctiles, proporcionando una experiencia
 * de usuario coherente entre dispositivos.
 *
 * @returns El elemento JSX que renderiza las tarjetas con scroll horizontal para móviles.
 */
export default function TarjetasColoresScroll() {
  return (
    <div className="overflow-x-auto">
      <div className="flex flex-row space-x-6 animate-fade-in-up w-max ">
        {/* Tarjeta del Paso 1: Expediente de Documentos */}
        <Link href="/candidato/expediente?tab=expediente">
          <div className="bg-[#bdabfa] rounded-xl p-4 text-[#0d324f] w-52 h-60 space-y-2 cursor-pointer">
            <h1 className="text-md pb-10">1°</h1>
            <Archive className="size-9" />
            <p className="font-semibold">
              Sube todos tus documentos al expediente.
            </p>
          </div>
        </Link>

        {/* Tarjeta del Paso 2: Gestión de Contratos */}
        <Link href="/candidato/expediente?tab=contratos">
          <div className="bg-[#fee6c2] rounded-xl p-4 text-[#0d324f] w-52 h-60 space-y-2 cursor-pointer">
            <h1 className="text-md pb-10">2°</h1>
            <FileUser className="size-9" />
            <p className="font-semibold">Descarga, firma y sube tu contrato.</p>
          </div>
        </Link>

        {/* Tarjeta del Paso 3: Proceso de Onboarding */}
        <Link href="/candidato/onboarding">
          <div className="bg-[#e9ff70] rounded-xl p-4 text-[#0d324f] w-52 h-60 space-y-2 cursor-pointer">
            <h1 className="text-md pb-10">3°</h1>
            <Handshake className="size-9" />
            <p className="font-semibold mt-auto">
              Lee los documentos y ve los videos.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
