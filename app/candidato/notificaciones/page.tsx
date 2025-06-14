import { urbanist } from "@/app/components/fonts";
import ShowNotifications from "@/app/components/shownotifications";

export default function CandidateNotifications() {
  return (
    <div className="flex flex-col space-y-2 p-4">
      <h1
        className={`${urbanist.className} text-4xl text-[#212529] pl-4 font-bold mb-4 animate-fade-in-up`}
      >
        Notificaciones
      </h1>
      <ShowNotifications />
    </div>
  );
}
