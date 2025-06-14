import { Archive, FileUser, Handshake } from "lucide-react";
import Link from "next/link";

export default function TarjetasColoresScroll() {
  return (
    <div className="overflow-x-auto">
      <div className="flex flex-row space-x-6 animate-fade-in-up w-max">
        <Link href="/candidato/expediente?tab=expediente">
          <div className="bg-[#bdabfa] rounded-xl p-4 text-[#0d324f] w-52 h-60 space-y-2 cursor-pointer">
            <h1 className="text-md pb-10">1°</h1>
            <Archive className="size-9" />
            <p className="font-semibold">Sube todos tus documentos al expediente.</p>
          </div>
        </Link>
        <Link href="/candidato/expediente?tab=contratos">
          <div className="bg-[#fee6c2] rounded-xl p-4 text-[#0d324f] w-52 h-60 space-y-2 cursor-pointer">
            <h1 className="text-md pb-10">2°</h1>
            <FileUser className="size-9" />
            <p className="font-semibold">Descarga, firma y sube tu contrato.</p>
          </div>
        </Link>
        <Link href="/candidato/onboarding">
          <div className="bg-[#e9ff70] rounded-xl p-4 text-[#0d324f] w-52 h-60 space-y-2 cursor-pointer">
            <h1 className="text-md pb-10">3°</h1>
            <Handshake className="size-9" />
            <p className="font-semibold mt-auto">Lee los documentos y ve los videos.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
