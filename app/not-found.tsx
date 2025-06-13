/**
 * not-found.tsx
 *
 * Proporciona la página de error 404 personalizada para el sistema de contrataciones.
 *
 * Este componente maneja todas las situaciones donde el usuario intenta acceder
 * a una ruta que no existe en la aplicación. Presenta una interfaz amigable y
 * profesional con el branding de Grupo Pissa, mensaje explicativo claro y
 * navegación de retorno al inicio. Incluye diseño responsivo optimizado para
 * dispositivos móviles y de escritorio con esquema de colores corporativo.
 */

import Image from "next/image";
import { urbanist } from "@/app/components/fonts";
import Link from "next/link";

/**
 * Renderiza la página de error 404 con diseño corporativo y navegación de retorno.
 *
 * Este componente proporciona una experiencia de error amigable y profesional cuando
 * los usuarios intentan acceder a rutas inexistentes en el sistema. Implementa un
 * diseño responsivo que se adapta entre móvil y escritorio: en móvil presenta un
 * fondo azul corporativo con tarjeta blanca centrada, mientras que en escritorio
 * muestra un layout centrado con logotipo prominente. Incluye mensaje explicativo
 * claro sobre el error, sugerencias para el usuario y botón de navegación directa
 * al inicio con efectos hover que mantienen la consistencia visual del sistema.
 *
 * @returns El elemento JSX que renderiza la página completa de error 404.
 *
 * @example
 * ```tsx
 * // Esta página se renderiza automáticamente cuando:
 * // - Usuario accede a /ruta-inexistente
 * // - Se navega a un ID de usuario que no existe
 * // - Se intenta acceder a páginas eliminadas o movidas
 * // - Enlaces rotos o URLs malformadas
 *
 * // Proporciona:
 * // - Mensaje claro sobre el error encontrado
 * // - Sugerencias para resolver el problema
 * // - Navegación directa de retorno al inicio
 * // - Diseño consistente con el branding corporativo
 * // - Experiencia responsiva para todos los dispositivos
 *
 * // Casos de uso comunes:
 * // /dashboard/usuario-inexistente -> Muestra esta página 404
 * // /pagina-eliminada -> Redirige a esta interfaz de error
 * // /typo-en-url -> Presenta opción de retorno al inicio
 * ```
 */
export default function NotFound() {
  return (
    <div className="bg-[#2d4583] md:bg-white h-screen p-8 md:flex md:justify-center md:items-center">
      <div className="bg-white md:bg-white p-8 rounded-xl shadow-lg w-full md:w-1/2 flex flex-col items-center gap-6">
        <Image
          src="/logo_pissa.png"
          alt="Logo"
          width={100}
          height={60}
          className="hidden md:block"
        />
        <h2
          className={`text-2xl md:text-3xl font-bold text-black ${urbanist.className}`}
        >
          Página no encontrada
        </h2>
        <p className="text-black text-center">
          Revisa que la URL sea correcta o regresa a la página principal.
        </p>
        <Link
          href="/"
          className="bg-[#2d4583] text-white px-6 py-2 rounded-lg hover:bg-[#08b177] transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
