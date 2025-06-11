import { ArrowUpRight } from "lucide-react";
import { urbanist } from "./fonts";
import Link from "next/link";
import PreviewRecover from "./previewRecover";

export default function PasswordRequest () {
    return(
        <main className="p-8 bg-white shadow-md rounded-xl h-full w-full">
            <div className="flex flex-row">
                <h2 className={`${urbanist.className} text-[#212529] font-bold text-2xl mb-2 animate-fade-in-up`}>
                    Recuperación de contraseñas
                </h2>
                <Link href="dashboard/security/recover">
                    <button className="text-sm cursor-pointer bg-[#2d4583] hover:bg-[#08b177] text-white rounded-full p-2 transition-transform transform hover:scale-110"><ArrowUpRight/></button>
                </Link>
            </div>
            <div className="overflow-y-auto flex-1">
                <PreviewRecover/>
            </div>
        </main>
    )
}