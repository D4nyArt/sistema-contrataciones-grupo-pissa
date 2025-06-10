import { Building, FolderOpenDot, UserPlus } from "lucide-react";
import CantCandidatos from "./cantidad-candidatos";
import CantProyectos from "./cantidad-usr-proyectos";
import CantCorporativo from "./cantidad-usr-corporativo";

export default function ContadoresPhoneScroll () {
    return(
        <div className="overflow-x-auto mt-6">
            <div className="flex flex-row space-x-6 animate-fade-in-up w-max">
                <div className="bg-white rounded-xl p-6 shadow-md flex flex-row justify-center items-center gap-8">
                    <div className="bg-[#42b883] rounded-full p-4 text-white">
                    <UserPlus />
                    </div>
                    <div className="flex flex-col">
                    <h2 className="text-[#495057]">Candidatos</h2>
                    <CantCandidatos />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md flex flex-row justify-center items-center gap-8">
                    <div className="bg-[#d55672] rounded-full p-4 text-white">
                    <FolderOpenDot />
                    </div>
                    <div className="flex flex-col">
                    <h2 className="text-[#495057]">Proyecto</h2>
                    <CantProyectos />
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md flex flex-row justify-center items-center gap-8 col-start-4 row-start-1">
                    <div className="bg-[#aec5eb] rounded-full p-4 text-white">
                    <Building />
                    </div>
                    <div className="flex flex-col">
                    <h2 className="text-[#495057]">Corporativo</h2>
                    <CantCorporativo />
                    </div>
                </div>
            </div>
        </div>
    )
}