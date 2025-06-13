/**
 * tarjetasColores.tsx
 *
 * Proporciona un conjunto de tarjetas informativas con flujo de proceso para candidatos.
 *
 * Este componente renderiza una serie de tarjetas de colores que guían a los candidatos
 * a través del proceso de incorporación al sistema. Cada tarjeta representa un paso
 * específico del flujo de trabajo con iconografía distintiva, colores únicos y navegación
 * directa a la funcionalidad correspondiente. Incluye efectos de hover para mejorar la
 * interactividad y proporciona una experiencia de usuario intuitiva y visualmente atractiva.
 */

import { Archive, FileUser, Handshake } from "lucide-react";
import Link from "next/link";

/**
 * Renderiza un conjunto de tarjetas de proceso paso a paso para candidatos.
 *
 * Este componente proporciona una interfaz visual que guía a los candidatos a través
 * del proceso completo de incorporación al sistema mediante tarjetas informativas
 * interactivas. Cada tarjeta representa un paso secuencial del flujo de trabajo:
 * expediente de documentos, gestión de contratos y proceso de onboarding. Las tarjetas
 * incluyen numeración clara, iconografía representativa, descripciones concisas y
 * efectos de hover que mejoran la experiencia interactiva. La navegación directa
 * mediante enlaces de Next.js facilita el acceso inmediato a cada funcionalidad.
 *
 * @returns El elemento JSX que renderiza las tres tarjetas de proceso secuencial.
 *
 * @example
 * ```tsx
 * // Uso en dashboard principal de candidatos
 * <div className="candidate-dashboard">
 *   <h1>Bienvenido al Sistema</h1>
 *   <p>Sigue estos pasos para completar tu incorporación:</p>
 *   <TarjetasColores />
 * </div>
 *
 * // En página de inicio de candidatos
 * <div className="welcome-section">
 *   <WelcomeMessage />
 *   <TarjetasColores />
 *   <AdditionalInfo />
 * </div>
 *
 * // Como parte de flujo de onboarding
 * <div className="onboarding-flow">
 *   <ProgressIndicator />
 *   <TarjetasColores />
 *   <NextStepButton />
 * </div>
 * ```
 */
export default function TarjetasColores() {
  return (
    <div className="flex flex-row space-x-6 animate-fade-in-up">
      {/* Tarjeta del Paso 1: Expediente de Documentos */}
      <Link href="/candidato/expediente?tab=expediente">
        <div className="bg-[#bdabfa] rounded-xl p-4 text-[#0d324f] w-50 h-60 space-y-2 cursor-pointer transition-transform transform hover:scale-105">
          <h1 className="text-md pb-10">1°</h1>
          <Archive className="size-9" />
          <p className="font-semibold">
            Sube todos tus documentos al expediente.
          </p>
        </div>
      </Link>

      {/* Tarjeta del Paso 2: Gestión de Contratos */}
      <Link href="/candidato/expediente?tab=contratos">
        <div className="bg-[#fee6c2] rounded-xl p-4 text-[#0d324f] w-50 h-60 space-y-2 cursor-pointer transition-transform transform hover:scale-105">
          <h1 className="text-md pb-10">2°</h1>
          <FileUser className="size-9" />
          <p className="font-semibold">Descarga, firma y sube tu contrato.</p>
        </div>
      </Link>

      {/* Tarjeta del Paso 3: Proceso de Onboarding */}
      <Link href="/candidato/onboarding">
        <div className="bg-[#e9ff70] rounded-xl p-4 text-[#0d324f] w-50 h-60 space-y-2 cursor-pointer transition-transform transform hover:scale-105">
          <h1 className="text-md pb-10">3°</h1>
          <Handshake className="size-9" />
          <p className="font-semibold mt-auto">
            Lee los documentos y ve los videos.
          </p>
        </div>
      </Link>
    </div>
  );
}
