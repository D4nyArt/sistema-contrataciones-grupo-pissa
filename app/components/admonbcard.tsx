import OnboardingCard from "@/app/components/OnboardingCard";
import { ref, get } from "firebase/database";
import { database } from "@/firebaseConfig";
import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";
import PopUp from "./pop-up";
import GenerateOnboardingCard from "./generateonboarding";
import type { OnbCard } from "@/app/types/OnbCard";

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

export default function AdminOnboardingPage({
  contractid,
}: {
  contractid: string;
}) {
  const [onbCards, setOnbCards] = useState<Record<string, OnbCard>>({});
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
