'use client'

import { useState } from "react";
import { Menu } from "lucide-react";
import ForLogOut from "./logOut";
import FAQ from "./faq";
import Link from "next/link";

export default function MenuPhone() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  return (
    <div>
      <button
        onClick={toggleMenu}
        className="p-2 bg-[#0d324f] text-white rounded-md md:hidden"
        title="Menú"
      >
        <Menu className="w-6" />
      </button>
      {open && (
        <div className="absolute top-10 right-0 text-white bg-[#0d324f] shadow-lg rounded-lg p-2 w-32">
          <div className="flex flex-col gap-3">
            <Link href="/faq">
              <div className="flex items-center gap-2">
                <FAQ />
                <span className="text-xs">FAQ</span>
              </div>
            </Link>
            <div className="flex items-center gap-2" onClick={() => document.getElementById('logout-button')?.click()}>
              <ForLogOut />
              <span className="text-xs">Cerrar sesión</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}