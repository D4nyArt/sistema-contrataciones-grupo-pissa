import OnboardingCard from '@/app/components/OnboardingCard'
import { cookies } from 'next/headers'
import { ref, get } from 'firebase/database'
import { database } from '@/firebaseConfig'
import { urbanist } from '@/app/components/fonts'
import { FolderX } from 'lucide-react'

async function getRole() {
  const cookieStore = await cookies()
  const uid = cookieStore.get('candidateId')?.value || null;
  let role: string | null = null;

  if (uid) {
    const snapshot = await get(ref(database, `usuarios/${uid}/rol`));
    if (snapshot.exists()) role = snapshot.val() as string;
  }

  return role;
}

async function getContractid() {
  let contract_id: string = "";
  const cookieStore = await cookies()
  const uid = cookieStore.get('candidateId')?.value || null

  const contract_ref = ref(database, `expedientes/expediente${uid}/contratos/id`);
  
  if (uid) {
  const contract_snap = await get(contract_ref); 
  if (contract_snap.exists()) contract_id = contract_snap.val() as string;
  }

  return contract_id;
}


type OnbCard = { nombre: string; url: string, type: string }
async function getListOnbCards(rol: string, contract_id: string): Promise<Record<string, OnbCard>> {


  if (rol === 'enCorporativo') {
    const snapshot = await get(ref(database, `contratos/corporativo/${contract_id}/onb${contract_id}`))
    if (snapshot.exists()) return snapshot.val() as Record<string, OnbCard>
  }
  if (rol === 'enProyecto') {
    const snapshot = await get(ref(database, `contratos/proyectos/${contract_id}/onb${contract_id}`))
    if (snapshot.exists()) return snapshot.val() as Record<string, OnbCard>
  }
  return {}
}

export default async function OnboardingPage() {
  const role = await getRole();
  const contract_id = await getContractid();

  // Si no tiene contrato aún, mostrar mensaje informativo
  if (role !== 'enCorporativo' && role !== 'enProyecto') {
    return (
      <main className='h-120 items-center flex flex-col text-gray-500'>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <FolderX className='size-20'/>
          <h3 className='text-center text-wrap font-bold'>Onboarding no disponible.</h3> 
          <p className='text-center text-wrap'>
            Debido a que aún no tienes un contrato asignado,
            la zona de Onboarding está vacía.
          </p>
        </div>
      </main>
    )
  }

  const onbCards = await getListOnbCards(role, contract_id);

  return (
    <main className="mb-10">
      <p className="mb-10">Tu rol es: <strong>{role}</strong></p>
      <div className="parent grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-x-4 gap-y-10 content-center">
        {Object.entries(onbCards).map(([key, card]) => (
          <OnboardingCard
            key={key}
            nombre={card.nombre}
            url={card.url}
            type={card.type}
          />
        ))}
      </div>
    </main>
  )
}