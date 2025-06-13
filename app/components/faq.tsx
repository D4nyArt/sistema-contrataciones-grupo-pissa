/**
 * faq.tsx
 *
 * Proporciona componentes de navegación a la página de preguntas frecuentes (FAQ).
 *
 * Este módulo incluye dos variantes de botones FAQ: uno para navegación general
 * dentro de la aplicación y otro específicamente diseñado para la página de login
 * con estilos flotantes y posicionamiento absoluto. Ambos componentes facilitan
 * el acceso rápido a información de ayuda para los usuarios.
 */

"use client";

import { MessageCircleQuestion } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * Renderiza un botón simple para navegar a la página de preguntas frecuentes.
 *
 * Este componente proporciona un botón minimalista con icono que redirige
 * a los usuarios a la página de FAQ del sistema. Diseñado para ser integrado
 * en barras de navegación, toolbars o áreas de ayuda general de la aplicación.
 *
 * @returns El elemento JSX que renderiza el botón de FAQ básico.
 *
 * @example
 * ```tsx
 * // Uso en barra de navegación
 * <div className="nav-toolbar">
 *   <FAQ />
 *   <OtherNavButtons />
 * </div>
 *
 * // En sección de ayuda
 * <div className="help-section">
 *   <h3>¿Necesitas ayuda?</h3>
 *   <FAQ />
 * </div>
 * ```
 */
export default function FAQ() {
  /** Hook de Next.js para navegación programática. */
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("faq")}
      className="cursor-pointer"
      title="Preguntas frecuentes"
    >
      <MessageCircleQuestion className="w-6" />
    </button>
  );
}

/**
 * Renderiza un botón flotante de FAQ específicamente diseñado para la página de login.
 *
 * Este componente proporciona un botón de ayuda flotante con estilos prominentes
 * y posicionamiento absoluto, optimizado para la experiencia de usuario en la
 * página de inicio de sesión. Incluye efectos hover y sombras para mejorar la
 * visibilidad y accesibilidad del botón de ayuda.
 *
 * @returns El elemento JSX que renderiza el botón flotante de FAQ para login.
 *
 * @example
 * ```tsx
 * // Uso en página de login
 * <div className="login-page">
 *   <LoginForm />
 *   <LoginFAQ />
 * </div>
 *
 * // El botón se posiciona automáticamente:
 * // - Esquina superior derecha en móvil
 * // - Esquina inferior derecha en desktop
 * ```
 */
export function LoginFAQ() {
  const router = useRouter();

  return (
    <div className="absolute top-4 right-4 md:top-auto md:right-6 md:bottom-6 flex flex-col items-end">
      <button
        onClick={() => router.push("/faq")}
        className="cursor-pointer bg-white hover:bg-[var(--pissa-green)] text-[var(--pissa-blue)] hover:text-white rounded-full p-4 shadow-lg transition-all"
        title="Preguntas frecuentes"
      >
        <MessageCircleQuestion className="w-6" />
      </button>
    </div>
  );
}
