"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProfilePicture from "./profile-picture";
import { Mail, Phone } from "lucide-react";
import { urbanist } from "./fonts";

import type { User } from "@/app/types/user";

export default function UserCard({ user }: { user: User }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullPath = `${pathname}?${searchParams.toString()}`;

  return (
    <div
      onClick={() => router.push(`/dashboard/${user.id}?from=${encodeURIComponent(fullPath)}`)}
      className="cursor-pointer p-4 bg-white rounded-xl shadow-md transition-transform transform hover:scale-105 md:h-30 h-45 flex flex-col animate-fade-in-up"
    >
      <div className="flex flex-col md:flex-row md:justify-between">
        <div className="flex-none pr-2">
          <ProfilePicture
            nombre={`${user.nombre || ""}`}
            width="w-8"
            height="h-8"
            textSize="text-xl"
          />
        </div>
        <div
          className={`${urbanist.className} text-lg font-semibold text-black pb-4 flex-auto`}
        >
          {user.nombre || "N/A"} {user.apellidos || ""}
        </div>
        <div className="text-sm text-[#2975a0] flex-initial capitalize">
          {user.rol || "N/A"}
        </div>
      </div>
      <div className="text-sm text-[#495057] flex flex-row">
        <Mail className="pr-2" /> {user.email || "N/A"}
      </div>
      <div className="text-sm text-[#495057] flex flex-row">
        <Phone className="pr-2" />
        {user.telefono || "N/A"}
      </div>
    </div>
  );
}
