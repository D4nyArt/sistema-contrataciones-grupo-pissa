"use client"

import OnboardingCard from '@/app/components/OnboardingCard'
import { ref, get } from 'firebase/database'
import { database } from '@/firebaseConfig'
import { useEffect, useState } from 'react'
import { PlusIcon } from 'lucide-react'
import PopUp from './pop-up'
import GenerateOnboardingCard from './generateonboarding'

type OnbCard = { nombre: string; url: string, type: string, accepted: boolean}

async function    getListOnbCards(): Promise<Record<string, OnbCard>> {
    const snap = await get(ref(database, `onboardingcard/`))
    if (snap.exists()) return snap.val() as Record<string, OnbCard>

  return {}
}

export default function AdminOnboardingPage() {
  const [onbCards, setOnbCards] = useState<Record<string, OnbCard>>({})
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    getListOnbCards().then(setOnbCards)
  }, [onbCards])

  return (
    <main className="relative">
      <button
        onClick={() => setShowConfirm(true)}
        className="animate-fade-in-up mb-12 cursor-pointer px-4 py-4 rounded-lg bg-[#2d4583] hover:bg-[#08b177] text-white shadow-lg flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <PlusIcon className='md:pr-2'/>
        <span className='md:block hidden'>Nuevo apartado</span>
      </button>
      <div className="parent grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-x-4 gap-y-10 content-center">
        {Object.entries(onbCards).map(([key, card]) => (
          <OnboardingCard key={key} nombre={card.nombre} url={card.url} type = {card.type} />
        ))}
      </div>
      <PopUp show = {showConfirm} onClose={() => setShowConfirm(false)}>
        <GenerateOnboardingCard/>
      </PopUp>
    </main>
  )
}
