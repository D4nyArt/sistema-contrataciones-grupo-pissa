import { urbanist } from "@/app/components/fonts"
import ShowNotifications from "@/app/components/shownotifications"

export default function Notificaciones() {
    return(
        <div>
            <h1 className={`${urbanist.className} text-4xl text-[#212529] pl-4 font-bold mb-4 animate-fade-in-up`}>Notificaciones</h1>
            <ShowNotifications />
        </div>
    )
}
