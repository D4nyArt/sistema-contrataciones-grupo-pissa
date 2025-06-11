/**
 * candidato/onboarding/page.tsx
 *
 * Componente de página de incorporación inicial para nuevos candidatos.
 *
 * Esta página guía a los candidatos recién registrados a través del proceso
 * de configuración inicial de su perfil y expediente. Incluye pasos para
 * completar información personal, subir documentos requeridos, configurar
 * preferencias y familiarizarse con las funcionalidades del sistema.
 * Proporciona una experiencia guiada paso a paso para una incorporación
 * exitosa al proceso de contratación.
 */

import { urbanist } from "@/app/components/fonts";
import OnboardingPage from "@/app/components/OnboardingPage";

export default function Onboarding() {
  return (
    <>
      <h1 className={`${urbanist.className} font-bold text-4xl text-[#212529]`}>
        Onboarding
      </h1>
      <OnboardingPage />
    </>
  );
}
