import { Building, FolderOpenDot, UserPlus } from "lucide-react";
import CantCandidatos from "./cantidad-candidatos";
import CantProyectos from "./cantidad-usr-proyectos";
import CantCorporativo from "./cantidad-usr-corporativo";

export default function ContadoresPhoneScroll () {
    return(
        <div className="overflow-x-auto mt-6">
            <div className="flex flex-row space-x-6 animate-fade-in-up">
                <div className="bg-white rounded-xl p-6 shadow-md flex flex-col justify-center items-center gap-8">
                    <h2 className="text-[#495057]">Total de candidatos</h2>
                    <div className="flex flex-row justify-center items-center space-x-6">
                        <CantCandidatos />
                        <div className="bg-[#42b883] rounded-full p-4 text-white">
                            <UserPlus />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md flex flex-col justify-center items-center gap-8">
                    <h2 className="text-[#495057]">Total en proyecto</h2>
                    <div className="flex flex-row justify-center items-center space-x-6">
                        <CantProyectos />
                        <div className="bg-[#d55672] rounded-full p-4 text-white">
                            <FolderOpenDot />
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md flex flex-col justify-center items-center gap-8 col-start-4 row-start-1">
                    <h2 className="text-[#495057]">Total en corporativo</h2>
                    <div className="flex flex-row justify-center items-center space-x-6">
                        <CantCorporativo />
                        <div className="bg-[#aec5eb] rounded-full p-4 text-white">
                            <Building />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}