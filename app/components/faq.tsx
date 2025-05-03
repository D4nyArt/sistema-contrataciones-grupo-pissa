'use client'

import { MessageCircleQuestion } from 'lucide-react'

export default function FAQ() {
  return (
      <button
        onClick={() => {console.log("TODO OKKK")}}
        className="fixed bottom-6 left-48 p-3 items-center justify-center flex flex-col text-white hover:bg-[#2974a04b] rounded-xl"
      >
        <MessageCircleQuestion className="w-6" />
      </button>
  )
}