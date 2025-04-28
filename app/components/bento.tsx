import { FileUser, FolderDot, UserPlus, Users } from "lucide-react";
import CountUsers from "./countusers";
import CantCandidatos from "./cantidad-candidatos";
import CantProyectos from "./cantidad-usr-proyectos";
import CantCorporativo from "./cantidad-usr-corporativo";

export default function Bento() {
  return (
    <div className="md:grid md:grid-cols-4 md:grid-rows-5 gap-4 w-full h-full flex flex-col">
      <div className="bg-white rounded-xl p-6 shadow-md flex flex-row justify-center items-center gap-8">
        <div className="bg-[#f4a261] rounded-full p-4 text-white">
          <Users />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[#495057]">Empleados</h2>
          <CountUsers />
        </div>
      </div>
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
          <FolderDot />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[#495057]">Proyecto</h2>
          <CantProyectos />
        </div>
      </div>
      <div className="bg-gray-300 rounded-xl col-span-3 row-span-4 col-start-1 row-start-2"></div>
      <div className="bg-gray-300 rounded-xl row-span-4 col-start-4 row-start-2"></div>
      <div className="bg-white rounded-xl p-6 shadow-md flex flex-row justify-center items-center gap-8 col-start-4 row-start-1">
        <div className="bg-[#aec5eb] rounded-full p-4 text-white">
          <FileUser />
        </div>
        <div className="flex flex-col">
          <h2 className="text-[#495057]">Corporativo</h2>
          <CantCorporativo />
        </div>
      </div>
    </div>
  );
}
