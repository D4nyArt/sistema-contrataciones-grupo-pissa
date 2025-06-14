/**
 * menu-phone.tsx
 *
 * Proporciona un menú de navegación colapsable optimizado para dispositivos móviles.
 *
 * Este componente renderiza un menú hamburguesa que se expande para mostrar opciones
 * de navegación esenciales en dispositivos móviles. Incluye acceso rápido a preguntas
 * frecuentes y funcionalidad de cierre de sesión, manteniéndose oculto en pantallas
 * de escritorio para preservar el diseño responsivo de la aplicación.
 */

"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import ForLogOut from "./logOut";
import FAQ from "./faq";
import Link from "next/link";

/**
 * Renderiza un menú de navegación colapsable para dispositivos móviles.
 *
 * Este componente proporciona una solución de navegación optimizada para pantallas
 * pequeñas mediante un menú hamburguesa que se expande para revelar opciones
 * esenciales. Incluye enlaces directos a la página de FAQ y funcionalidad de
 * cierre de sesión, manteniéndose visible solo en dispositivos móviles para
 * preservar el espacio de pantalla y la usabilidad del diseño responsivo.
 *
 * @returns El elemento JSX que renderiza el menú móvil colapsable.
 *
 * @example
 * ```tsx
 * // Uso en header de navegación principal
 * <header className="app-header">
 *   <Logo />
 *   <DesktopNavigation />
 *   <MenuPhone />
 * </header>
 *
 * // En layout de aplicación móvil
 * <div className="mobile-layout">
 *   <div className="top-bar">
 *     <AppTitle />
 *     <MenuPhone />
 *   </div>
 *   <MainContent />
 * </div>
 * ```
 *
 * @see {@link ForLogOut} - Componente de cierre de sesión
 */
export default function MenuPhone() {
  /** Estado que controla la visibilidad del menú desplegable. */
  const [open, setOpen] = useState(false);

  /**
   * Alterna el estado de visibilidad del menú.
   *
   * Esta función cambia entre mostrar y ocultar el menú desplegable,
   * proporcionando una experiencia de navegación intuitiva para móviles.
   */
  const toggleMenu = () => setOpen(!open);

  return (
    <div>
      {/* Botón hamburguesa (visible solo en móviles) */}
      <button
        onClick={toggleMenu}
        className="p-2 bg-[#0d324f] text-white rounded-md md:hidden"
        title="Menú"
      >
        <Menu className="w-6" />
      </button>

      {/* Menú desplegable */}
      {open && (
        <div className="absolute top-10 right-0 text-white bg-[#0d324f] shadow-lg rounded-lg p-2 w-32">
          <div className="flex flex-col gap-3">
            {/* Enlace a FAQ */}
            <Link href="/faq">
              <div className="flex items-center gap-2">
                <FAQ />
                <span className="text-xs">FAQ</span>
              </div>
            </Link>

            {/* Opción de cierre de sesión */}
            <div
              className="flex items-center gap-2"
              onClick={() => document.getElementById("logout-button")?.click()}
            >
              <ForLogOut />
              <span className="text-xs">Cerrar sesión</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
