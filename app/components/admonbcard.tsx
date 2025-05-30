import OnboardingCard from '@/app/components/OnboardingCard'
import { ref, get } from 'firebase/database'
import { database } from '@/firebaseConfig'
import { useEffect, useState } from 'react'
import { PlusIcon } from 'lucide-react'
import PopUp from './pop-up'
import GenerateOnboardingCard from './generateonboarding'

type OnbCard = { nombre: string; url: string, type: string}

async function getListOnbCards(contractid: string): Promise<Record<string, OnbCard>> {
  if (contractid.startsWith("concorp")) {
    const snap = await get(ref(database, `contratos/corporativo/${contractid}/onb${contractid}`))
    if (snap.exists()) return snap.val() as Record<string, OnbCard>
  }
  if (contractid.startsWith("conproy")) {
    const snap = await get(ref(database, `contratos/proyectos/${contractid}/onb${contractid}`))
    if (snap.exists()) return snap.val() as Record<string, OnbCard>
  }
  return {}
}

export default function AdminOnboardingPage({ contractid }: { contractid: string }) {
  const [onbCards, setOnbCards] = useState<Record<string, OnbCard>>({})
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    getListOnbCards(contractid).then(setOnbCards)
  }, [contractid])

  return (
    <main className="relative p-8">
      <h1 className="text-2xl font-bold mb-4">Onboarding</h1>
      <div className="grid md:grid-cols-3 md:grid-rows-5 gap-4">
        {Object.entries(onbCards).map(([key, card]) => (
          <OnboardingCard key={key} nombre={card.nombre} url={card.url} type = {card.type} />
        ))}
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        className="absolute bottom-6 left-6 w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
      <PlusIcon className="w-8 h-8" />
      </button>
      <PopUp show = {showConfirm} onClose={() => setShowConfirm(false)}>
        <GenerateOnboardingCard id={contractid}/>
      </PopUp>
    </main>
  )
}
