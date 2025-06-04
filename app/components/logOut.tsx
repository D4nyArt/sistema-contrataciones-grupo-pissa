'use client'

import { useRouter } from "next/navigation";
import { LogOut} from "lucide-react";

export default function ForLogOut(){
    const router = useRouter();

    localStorage.clear();
    sessionStorage.clear();

    const onLogout = async () => {
    await fetch("/api/deleteCookie?name=candidateId", {
        method: "DELETE",
    }).then((resp) => {
        console.log(resp);
    });
    router.replace("/");
    window.location.replace("/");
    };

    return(
        <button
            id="logout-button"
            onClick={onLogout}
            className="cursor-pointer"
            title="Cerrar sesión"
        >
            <LogOut className="w-6" />
        </button>
    )
}