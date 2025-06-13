/**
 * etiquetaEstado.tsx
 *
 * Proporciona un componente para mostrar etiquetas visuales de estado de usuario.
 *
 * Este componente renderiza badges con iconos y colores específicos que representan
 * visualmente el estado actual de los usuarios en el sistema. Cada estado tiene un
 * esquema de colores único y un icono descriptivo para facilitar la identificación
 * rápida del estado del usuario en interfaces de administración y listados.
 */

import { CircleCheck, Lock, UserMinus, Clock, Undo } from "lucide-react";

/**
 * Define las propiedades del componente EtiquetaEstado.
 */
interface EtiquetaEstadoProps {
  /** El estado del usuario a mostrar visualmente. */
  status: string;
}

/**
 * Mapeo de configuraciones visuales para cada estado de usuario.
 *
 * Define los estilos, iconos y etiquetas para todos los estados posibles:
 * - normal: Usuario activo y operativo
 * - bloqueado: Usuario temporalmente bloqueado por intentos fallidos
 * - dado de baja: Usuario deshabilitado permanentemente
 * - enProceso: Usuario en proceso de recuperación de cuenta
 * - previo: Usuario con credenciales recién creadas
 */
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

/**
 * Renderiza una etiqueta visual que representa el estado de un usuario.
 *
 * Este componente muestra un badge con fondo coloreado, icono descriptivo y texto
 * que identifica visualmente el estado actual del usuario. Utiliza un sistema de
 * mapeo para asociar cada estado con su configuración visual correspondiente,
 * facilitando la identificación rápida en interfaces de administración.
 *
 * @param props - Las propiedades del componente.
 * @param props.status - El estado del usuario a representar visualmente.
 * @returns El elemento JSX que renderiza la etiqueta de estado, o null si el estado no es reconocido.
 *
 * @example
 * ```tsx
 * // Etiqueta para usuario activo
 * <EtiquetaEstado status="normal" />
 *
 * // Etiqueta para usuario bloqueado
 * <EtiquetaEstado status="bloqueado" />
 *
 * // En una tabla de usuarios
 * {usuarios.map(usuario => (
 *   <tr key={usuario.id}>
 *     <td>{usuario.nombre}</td>
 *     <td><EtiquetaEstado status={usuario.estadoUsuario} /></td>
 *   </tr>
 * ))}
 * ```
 */
export default function EtiquetaEstado({ status }: EtiquetaEstadoProps) {
  /** Configuración visual para el estado actual. */
  const config = statusMap[status as keyof typeof statusMap];

  // Retorna null si el estado no está definido en el mapeo
  if (!config) return null;

  return (
    <div className="flex flex-row items-center">
      <div
        className={`flex flex-row items-center px-4  ${config.bg} rounded-lg w-35 justify-center`}
      >
        {config.icon}
        <p className={`pl-1 ${config.text} normal-case`}>{config.label}</p>
      </div>
    </div>
  );
}
