'use client'

import { useRouter } from "next/navigation";
import { LogOut} from "lucide-react";

export default function ForLogOut(){
    const router = useRouter();

    const onLogout = async () => {
    await fetch("/api/deleteCookie?name=candidateId", {
        method: "DELETE",
    }).then((resp) => {
        console.log(resp);
        router.push("/auth/redirector");
    });
    };

    return(
        <button
            onClick={onLogout}
            className="cursor-pointer fixed bottom-6 left-48 p-3 items-center justify-center flex flex-col text-white hover:bg-[#2974a04b] rounded-xl"
            title="Cerrar sesión"
        >
            <LogOut className="w-6" />
        </button>
    )
}