import Proceso from "../components/candidatoBienvenida";
import { urbanist } from "../components/fonts";

function obtenerSaludo(): string {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 12) return "Buenos días";
  if (hora >= 12 && hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function Bienvenida() {
    return (
      <div className="space-y-6">
        <h1 className={`${urbanist.className} text-4xl font-bold animate-fade-in-up text-[#212529]`}>{obtenerSaludo()}</h1>
        <Proceso/>
      </div>
    );
  }
  