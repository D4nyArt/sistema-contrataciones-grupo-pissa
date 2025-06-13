'use client'

import { useEffect, useState } from 'react'
import OnboardingCard from '@/app/components/OnboardingCard'
import { ref, get, update } from 'firebase/database'
import { auth, database } from '@/firebaseConfig'
import { urbanist } from '@/app/components/fonts'

type OnbCard = {
  nombre: string
  url: string
  type: string
}

export default function OnboardingPage() {
  const [role, setRole] = useState<string | null>(null)
  const [contractId, setContractId] = useState<string>('')
  const [onbCards, setOnbCards] = useState<Record<string, OnbCard>>({})
  const [acceptedCards, setAcceptedCards] = useState<Record<string, OnbCard>>({});
  const [userID, setUserID] = useState("");


  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch('/api/getCurrentUserID')
        const id = await res.json();
      

        console.log(id);
        const uid = id.value
        setUserID(uid);
      
        

        // Fetch role
        const roleSnap = await get(ref(database, `usuarios/${uid}/rol`))
        const userRole = roleSnap.exists() ? (roleSnap.val() as string) : null
        setRole(userRole)

      
        // Fetch onboarding cards
        if (userRole) {
          let cardsRef = "onboardingcard";

          const cardsSnap = await get(ref(database, cardsRef))
          if (cardsSnap.exists()) {
            setOnbCards(cardsSnap.val() as Record<string, OnbCard>)
            console.log(onbCards);
          }
        }
      } catch (error) {
        console.error('Error loading onboarding data:', error)
      }
    }

    fetchUserData()
  }, [userID])

  if (!role) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Onboarding</h1>
        <p>Cargando información...</p>
      </main>
    )
  }

  if (role !== 'enCorporativo' && role !== 'enProyecto') {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Onboarding</h1>
        <p>
          Tu rol es <strong>{role ?? 'candidato'}</strong>. Debido a que aún no tienes un
          contrato asignado, la zona de Onboarding no está disponible.
        </p>
      </main>
    )
  }

  const reference = `onboarding/Onb${userID}`;

  return (
    <main className="mb-10">
      <h1 className={`${urbanist.className} font-bold text-4xl text-[#212529]`}>Onboarding</h1>
      <p className="mb-10">
        Tu rol es: <strong>{role}</strong>
      </p>
      <div className="parent grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-x-4 gap-y-10 content-center">
        {Object.entries(onbCards).map(([key, card]) => (
          <OnboardingCard
            key={key}
            nombre={card.nombre}
            url={card.url}
            type={card.type}
            reference={reference}
          />
        ))}
      </div>
    </main>
  )
}
