import { Users } from "lucide-react";
import CountUsers from "./countusers";
import ContadoresPhoneScroll from "./contadoresScrollPhone";
import RevisandoListPhone from "./candidatoSeguidosPhone";

export default function HomePage () {
    return(
        <>
            <div className="bg-[#0d324f] rounded-xl p-8 space-x-6 flex flex-row justify-center items-center w-full animate-fade-in-up">
                <div className="space-y-2">
                    <p className="text-xl text-gray-400">Total de empleados</p>
                    <CountUsers />
                </div>
                <div className="bg-[#f4a261] rounded-full p-4 text-white flex ml-auto">
                    <Users className="size-10"/>
                </div>
            </div>
            <div className="block md:hidden">
                <ContadoresPhoneScroll/>
            </div>
            <div className="mt-6 block md:hidden">
                <RevisandoListPhone/>
            </div>
        </>
    )
}