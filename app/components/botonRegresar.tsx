// components/BotonRegresar.jsx
"use client";

import { useRouter } from "next/navigation";

export default function BotonRegresar() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="items-center flex hover:text-[#08b177] text-[#212529] group cursor-pointer"
    >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-arrow-left transition-all group-hover:scale-x-125"
        >
            <path d="M6 8L2 12L6 16" />
            <path d="M2 12H22" />
        </svg>
        <span className="pl-2">Regresar</span>
    </button>
  );
}