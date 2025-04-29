import Image from "next/image";
import NavLinks from "./nav-links";
<<<<<<< HEAD
<<<<<<< HEAD
=======
//import { LogOut } from "lucide-react";
>>>>>>> 4123d81 (Minor changes)
=======
//import { LogOut } from "lucide-react";
>>>>>>> 4123d81 (Minor changes)

interface SideNavProps {
  roleView: string;
}

export default function SideNav({ roleView }: SideNavProps) {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:py-2 md:px-0 bg-white">
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-21">
        <div className="h-auto w-full grow rounded-4xl bg-[#0d324f] md:block flex flex-row">
          <div className="w-full flex items-center md:pl-6 md:pt-6 md:pr-8 md:pb-12 pl-4">
            <Image
              width={100}
              height={50}
              alt="Logo de Grupo Pissa"
              src="/logo-blanco.png"
            />
          </div>
          <NavLinks roleView={roleView} />
        </div>
      </div>
    </div>
  );
}
