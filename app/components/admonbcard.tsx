/**
 * admonbcard.tsx
 *
 * Proporciona una interfaz administrativa para gestionar tarjetas de onboarding por contrato.
 *
 * Este componente permite a los administradores ver, crear y gestionar las tarjetas de
 * onboarding asociadas a un contrato específico. Incluye funcionalidad para obtener
 * tarjetas existentes de la base de datos y crear nuevas tarjetas mediante un popup modal.
 */

import OnboardingCard from "@/app/components/OnboardingCard";
import { ref, get } from "firebase/database";
import { database } from "@/firebaseConfig";
import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import PopUp from "./pop-up";
import GenerateOnboardingCard from "./generateonboarding";
import type { OnbCard } from "@/app/types/OnbCard";

/**
 * Obtiene la lista de tarjetas de onboarding asociadas a un contrato específico.
 *
 * Esta función consulta la base de datos para recuperar todas las tarjetas de onboarding
 * almacenadas bajo un ID de contrato. Maneja tanto contratos corporativos (concorp) como
 * de proyectos (conproy) consultando las rutas correspondientes en la base de datos.
 *
 * @param contractid - El ID del contrato del cual obtener las tarjetas de onboarding.
 * @returns Una promesa que resuelve a un objeto con las tarjetas de onboarding indexadas por clave.
 *
 * @example
 * ```ts
 * // Obtener tarjetas para un contrato corporativo
 * const cards = await getListOnbCards("concorp123");
 * console.log(cards); // { "card1": { nombre: "...", url: "...", ... }, ... }
 *
 * // Obtener tarjetas para un contrato de proyecto
 * const projectCards = await getListOnbCards("conproy456");
 * ```
 */
async function getListOnbCards(
  contractid: string
): Promise<Record<string, OnbCard>> {
  if (contractid.startsWith("concorp")) {
    const snap = await get(
      ref(
        database,
        `contratos/corporativo/${contractid}/onb${contractid}/cards/`
      )
    );
    if (snap.exists()) return snap.val() as Record<string, OnbCard>;
  }
  if (contractid.startsWith("conproy")) {
    const snap = await get(
      ref(database, `contratos/proyectos/${contractid}/onb${contractid}/cards/`)
    );
    if (snap.exists()) return snap.val() as Record<string, OnbCard>;
  }
  return {};
}

/**
 * Renderiza la página de administración de tarjetas de onboarding para un contrato específico.
 *
 * Este componente muestra una grilla de tarjetas de onboarding existentes y proporciona
 * un botón para crear nuevas tarjetas. Incluye un popup modal para la creación de tarjetas
 * y actualiza automáticamente la lista cuando se detectan cambios.
 *
 * @param props - Las propiedades del componente.
 * @param props.contractid - El ID del contrato cuyas tarjetas de onboarding se van a gestionar.
 * @returns El elemento JSX que renderiza la página de administración de onboarding.
 *
 * @example
 * ```tsx
 * // Renderizar la página de administración para un contrato específico
 * <AdminOnboardingPage contractid="concorp123" />
 * ```
 *
 * @see {@link OnboardingCard} - Componente individual que muestra cada tarjeta de onboarding
 * @see {@link GenerateOnboardingCard} - Componente para crear nuevas tarjetas de onboarding
 * @see {@link PopUp} - Componente modal utilizado para mostrar el formulario de creación
 */
export default function AdminOnboardingPage({
  contractid,
}: {
  contractid: string;
}) {
  /** Estado que almacena las tarjetas de onboarding del contrato. */
  const [onbCards, setOnbCards] = useState<Record<string, OnbCard>>({});

  /** Estado que controla la visibilidad del popup de creación de tarjetas. */
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    getListOnbCards(contractid).then(setOnbCards);
  }, [contractid, onbCards]);

  return (
    <main className="relative">
      <button
        onClick={() => setShowConfirm(true)}
        className="animate-fade-in-up mb-12 cursor-pointer px-4 py-4 rounded-lg bg-[#2d4583] hover:bg-[#08b177] text-white shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusIcon className="md:pr-2" />
        <span className="md:block hidden">Nuevo apartado</span>
      </button>
      <div className="parent grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-x-4 gap-y-10 content-center">
        {Object.entries(onbCards).map(([key, card]) => (
          <OnboardingCard
            key={key}
            nombre={card.nombre}
            url={card.url}
            type={card.type}
            accepted={card.accepted}
          />
        ))}
      </div>
      <PopUp show={showConfirm} onClose={() => setShowConfirm(false)}>
        <GenerateOnboardingCard id={contractid} />
      </PopUp>
    </main>
  );
}
