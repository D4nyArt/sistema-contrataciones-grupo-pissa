"use client";

import { ShieldCheck, KeyRound, User, Users, House, Archive, Handshake, UserPlus, Bell, FileText } from "lucide-react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from "react";

const linksRH = [
  { name: 'Inicio', href: '/dashboard', icon: House },
  { name: 'Personas', href: '/dashboard/personas', icon: Users },
  { name: 'Candidatos', href: '/dashboard/candidatos', icon: UserPlus},
  { name: 'Plantillas', href: '/dashboard/plantillas', icon: FileText },
  {name: 'Onboarding', href: '/dashboard/onboarding', icon: Handshake},
  { name: 'Seguridad', href: '/dashboard/security/recover', icon: ShieldCheck},
  { name: 'Credenciales', href: '/dashboard/security/credenciales', icon: KeyRound },
  { name: 'Notificaciones', href: '/dashboard/notificaciones', icon: Bell },
  { name: 'Perfil', href: '/dashboard/perfil', icon: User }
];

const linksCandidato = [
  { name: 'Inicio', href: '/candidato', icon: House },
  { name: 'Expediente', href: '/candidato/expediente', icon: Archive },
  { name: 'Onboarding', href: '/candidato/onboarding', icon: Handshake},
  { name: 'Notificaciones', href: '/candidato/notificaciones', icon: Bell },
  { name: 'Perfil', href: '/candidato/perfil', icon: User }
];

const Indicator = ({ offsetLeft }: { offsetLeft: number }) => (
  <div
    className="absolute -top-[45%] h-18 w-18 rounded-full bg-cyan-100 transition-all duration-500 ease-in-out"
    style={{ left: offsetLeft }}
  >
    <div
      className="absolute inset-0 rounded-full border-[6px] border-gray-50"
      style={{
        clipPath: "inset(40% 0% 0% 0%)",
      }}
    />
  </div>
);

export default function NavLinks({ roleView }: { roleView: string }) {
  const pathname = usePathname();
  const links = roleView === "RH" ? linksRH : linksCandidato;

  const [indicatorOffset, setIndicatorOffset] = useState(0);
  const [initialCheck, setInitialCheck] = useState(false);
  const activeIndex = links.findIndex(link => pathname === link.href);

  useEffect(() => {
    const mobileLinkWidth = 70;
    if (activeIndex !== -1) {
      setIndicatorOffset(activeIndex * mobileLinkWidth);
      setInitialCheck(true);
    }
  }, [activeIndex]);

  return (
    <>
      <div className="w-full md:hidden">
        <ul className="relative flex h-full w-full items-center justify-center">
          {initialCheck && <Indicator offsetLeft={indicatorOffset} />}
          {links.map((link) => {
            const LinkIcon = link.icon;
            const isActive = pathname === link.href;
            return (
              <li key={link.name} className="relative h-18 w-18">
                <Link href={link.href} className="relative flex h-full w-full flex-col items-center justify-center">
                  <div className={`transition-transform duration-500 ease-in-out ${isActive ? "-translate-y-8" : "translate-y-0"}`}>
                    <LinkIcon className={`h-7 w-7 ${isActive ? "text-[#0d324f]" : "text-[#c2c3c4]"}`} />
                  </div>
                  <div className={`absolute bottom-2 text-xs font-semibold text-cyan-100 transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0"}`}>{link.name}</div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="hidden w-full items-center md:block">
        {links.map((link) => {
          const LinkIcon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex h-[48px] mb-1 mr-4 ml-4 grow items-center justify-start gap-4 text-sm font-medium flex-none p-2 px-3
                ${isActive
                  ? "bg-[#2975a0] text-white shadow-md rounded-xl"
                  : "rounded-xl text-[#c2c3c4] hover:bg-[#2974a04b] hover:text-white"
                }`}
            >
              <LinkIcon className="w-6" />
              <p className="hidden md:block">{link.name}</p>
            </Link>
          );
        })}
      </div>
    </>
  );
}