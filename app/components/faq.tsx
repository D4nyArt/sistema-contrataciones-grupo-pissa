'use client'

import { MessageCircleQuestion } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FAQ() {
  const router = useRouter()

  return (
      <button
        onClick={() => router.push('/faq')}
        className="cursor-pointer fixed bottom-6 left-6 p-3 items-center justify-center flex flex-col text-white hover:bg-[#2974a04b] rounded-xl"
        title="Preguntas frecuentes"
      >
        <MessageCircleQuestion className="w-6" />
      </button>
  )
}

export function LoginFAQ() {
  const router = useRouter()
  
  return(
    <div className="fixed bottom-6 right-6 flex flex-col items-end">
      <button
        onClick={() => router.push('/faq')}
        className="cursor-pointer bg-white hover:bg-[var(--pissa-green)] text-[var(--pissa-blue)] hover:text-white rounded-full p-4 shadow-lg transition-all"
        title="Preguntas frecuentes"
      >
        <MessageCircleQuestion className="w-6 h-6" />
      </button>
    </div>
  )
}