"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BotonRegresar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const handleRegresar = () => {
    if (from) {
      router.push(from);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleRegresar}
      className="items-center flex hover:text-[#08b177] text-[#495057] group cursor-pointer"
    >
      <ChevronLeft/>
      <span className="pl-2">Regresar</span>
    </button>
  );
}
