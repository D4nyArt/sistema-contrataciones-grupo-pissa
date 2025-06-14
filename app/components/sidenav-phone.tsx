/**
 * sidenav-phone.tsx
 *
 * Proporciona una barra de navegación lateral optimizada para dispositivos móviles.
 *
 * Este componente renderiza una navegación lateral compacta específicamente diseñada
 * para pantallas móviles. Presenta los enlaces de navegación en un layout horizontal
 * con scroll lateral cuando es necesario, manteniendo la funcionalidad completa de
 * navegación en un formato optimizado para dispositivos táctiles y espacios reducidos.
 * Integra con el sistema de roles para mostrar enlaces apropiados según el usuario.
 */

import NavLinks from "./nav-links";

/**
 * Define las propiedades del componente SideNavPhone.
 */
interface SideNavPhoneProps {
  /** El rol del usuario que determina qué enlaces de navegación mostrar. */
  roleView: string;
}

/**
 * Renderiza una barra de navegación lateral adaptada para dispositivos móviles.
 *
 * Este componente proporciona una solución de navegación optimizada para pantallas
 * pequeñas, presentando los enlaces de navegación en un formato horizontal compacto
 * con capacidad de scroll lateral. Utiliza el componente NavLinks para generar los
 * enlaces apropiados según el rol del usuario, manteniendo la consistencia de la
 * navegación entre diferentes dispositivos mientras optimiza la experiencia en móviles.
 *
 * @param props - Las propiedades del componente.
 * @param props.roleView - El rol del usuario para determinar los enlaces de navegación visibles.
 * @returns El elemento JSX que renderiza la navegación lateral móvil.
 *
 * @example
 * ```tsx
 * // Uso en layout móvil para candidatos
 * <SideNavPhone roleView="candidato" />
 *
 * // Para personal de RH
 * <SideNavPhone roleView="rh" />
 *
 * // En layout responsivo
 * <div className="mobile-layout">
 *   <header>
 *     <AppHeader />
 *   </header>
 *   <nav className="md:hidden">
 *     <SideNavPhone roleView={userRole} />
 *   </nav>
 *   <main>
 *     {children}
 *   </main>
 * </div>
 *
 * // Con navegación condicional
 * {isMobile && (
 *   <SideNavPhone roleView={currentUser.role} />
 * )}
 * ```
 *
 * @see {@link NavLinks} - Componente que genera los enlaces de navegación según el rol
 */
export default function SideNavPhone({ roleView }: SideNavPhoneProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div 
        className="flex items-center justify-center p-2 h-17 w-full rounded-xl bg-[#0d324f]">
        <NavLinks roleView={roleView} />
      </div>
    </div>
  );
}