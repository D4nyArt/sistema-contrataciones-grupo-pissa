/**
 * notificaciones/page.tsx
 *
 * Proporciona la página principal del sistema de notificaciones para usuarios de RH.
 *
 * Esta página del dashboard presenta una interfaz completa para la gestión y
 * visualización de notificaciones del personal de Recursos Humanos. Incluye un
 * título prominente con tipografía corporativa y animaciones de entrada, seguido
 * del componente ShowNotifications que maneja toda la funcionalidad de filtrado,
 * paginación, marcado de lectura y navegación de notificaciones. Optimizada para
 * proporcionar una experiencia centralizada de gestión de comunicaciones.
 */

import { urbanist } from "@/app/components/fonts";
import ShowNotifications from "@/app/components/shownotifications";

export default function Notificaciones() {
  return (
    <div>
      <h1
        className={`${urbanist.className} text-4xl text-[#212529] pl-4 font-bold mb-4 animate-fade-in-up`}
      >
        Notificaciones
      </h1>
      <ShowNotifications />
    </div>
  );
}
