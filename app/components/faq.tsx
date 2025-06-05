'use client'

import { MessageCircleQuestion } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function FAQ() {
  const router = useRouter()

  return (
      <button
        onClick={() => router.push('/faq')}
        className="cursor-pointer"
        title="Preguntas frecuentes"
      >
        <MessageCircleQuestion className="w-6" />
      </button>
  )
}

export function LoginFAQ() {
  const router = useRouter()
  
  return(
    <div className="absolute top-4 right-4 md:top-auto md:right-6 md:bottom-6 flex flex-col items-end">
      <button
        onClick={() => router.push('/faq')}
        className="cursor-pointer bg-white hover:bg-[var(--pissa-green)] text-[var(--pissa-blue)] hover:text-white rounded-full p-4 shadow-lg transition-all"
        title="Preguntas frecuentes"
      >
        <MessageCircleQuestion className="w-6" />
      </button>
    </div>
  )
}