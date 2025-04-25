import Image from "next/image";
import NavLinks from "./nav-links";
import { LogOut } from "lucide-react";

export default function SideNavPhone() {
  return (
    <div className="flex h-full flex-col w-full">
      <div className="flex grow flex-row space-x-2">
        <div className="h-auto w-full grow rounded-full bg-[#0d324f] md:block flex flex-row justify-center items-center">
          <NavLinks />
        </div>
      </div>
    </div>
  );
}
