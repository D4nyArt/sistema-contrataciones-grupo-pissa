import OnboardingCard from '@/app/components/OnboardingCard'
import { cookies } from 'next/headers'
import { ref, get } from 'firebase/database'
import { database } from '@/firebaseConfig'
import { urbanist } from '@/app/components/fonts'

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


type OnbCard = { nombre: string; url: string }
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
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Onboarding</h1>
        <p>
          Tu rol es <strong>{role ?? 'candidato'}</strong>.  
          Debido a que aún no tienes un contrato asignado, 
          la zona de Onboarding no está disponible.
        </p>
      </main>
    )
  }

  const onbCards = await getListOnbCards(role, contract_id);

  return (
    <main className="mb-10">
      <h1 className={`${urbanist.className} font-bold text-4xl text-[#212529]`}>Onboarding</h1>
      <p className="mb-10">Tu rol es: <strong>{role}</strong></p>
      <div className="parent grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-rows-2 gap-x-4 gap-y-10 content-center">
        {Object.entries(onbCards).map(([key, card]) => (
          <OnboardingCard
            key={key}
            nombre={card.nombre}
            url={card.url}
          />
        ))}
      </div>
    </main>
  )
}