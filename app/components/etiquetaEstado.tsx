// components/EtiquetaEstado.tsx
import { CircleCheck, Lock, UserMinus, Clock, Undo } from "lucide-react";

interface EtiquetaEstadoProps {
  status: string;
}

const statusMap = {
  normal: {
    icon: <CircleCheck className="size-4 text-green-800" />,
    bg: "bg-green-100",
    text: "text-green-800",
    label: "Normal",
  },
  bloqueado: {
    icon: <Lock className="size-4 text-red-800" />,
    bg: "bg-red-100",
    text: "text-red-800",
    label: "Bloqueado",
  },
  "dado de baja": {
    icon: <UserMinus className="size-4 text-red-800" />,
    bg: "bg-red-100",
    text: "text-red-800",
    label: "Baja",
  },
  enProceso: {
    icon: <Clock className="size-4 text-gray-800" />,
    bg: "bg-gray-200",
    text: "text-gray-800",
    label: "En proceso",
  },
  previo: {
    icon: <Undo className="size-4 text-gray-800" />,
    bg: "bg-gray-200",
    text: "text-gray-800",
    label: "Previo",
  },
} as const;

export default function EtiquetaEstado({ status }: EtiquetaEstadoProps) {
  const config = statusMap[status as keyof typeof statusMap];

  if (!config) return null;

  return (
    <div className="flex flex-row items-center">
      <div className={`flex flex-row items-center px-4  ${config.bg} rounded-lg w-30 justify-center`}>
        {config.icon}
        <p className={`pl-1 ${config.text} normal-case`}>
          {config.label}
        </p>
      </div>
    </div>
  );
}
