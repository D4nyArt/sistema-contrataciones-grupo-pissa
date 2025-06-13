/**
 * sidenav.tsx
 *
 * Proporciona la barra de navegación lateral principal para dispositivos de escritorio.
 *
 * Este componente renderiza la navegación lateral completa del sistema, incluyendo el
 * logotipo de la empresa, enlaces de navegación basados en roles de usuario, y accesos
 * rápidos a funcionalidades esenciales como FAQ y cierre de sesión. Optimizado para
 * pantallas de escritorio con posicionamiento fijo de elementos auxiliares y diseño
 * vertical que maximiza el espacio disponible para la navegación principal.
 */

import Image from "next/image";
import NavLinks from "./nav-links";
import FAQ from "@/app/components/faq";
import ForLogOut from "@/app/components/logOut";
import Link from "next/link";

/**
 * Define las propiedades del componente SideNav.
 */
interface SideNavProps {
  /** El rol del usuario que determina qué enlaces de navegación mostrar. */
  roleView: string;
}

/**
 * Renderiza la barra de navegación lateral principal para dispositivos de escritorio.
 *
 * Este componente proporciona la navegación primaria del sistema en un layout vertical
 * optimizado para pantallas grandes. Incluye el logotipo corporativo de Grupo Pissa,
 * enlaces de navegación dinámicos basados en el rol del usuario, y elementos de acceso
 * rápido posicionados estratégicamente en la parte inferior. El diseño utiliza un fondo
 * azul corporativo y elementos fijos para mantener accesibilidad constante a funciones
 * esenciales como FAQ y cierre de sesión.
 *
 * @param props - Las propiedades del componente.
 * @param props.roleView - El rol del usuario para determinar los enlaces de navegación visibles.
 * @returns El elemento JSX que renderiza la barra de navegación lateral completa.
 *
 * @example
 * ```tsx
 * // Uso en layout principal para candidatos
 * <div className="app-layout">
 *   <SideNav roleView="candidato" />
 *   <main className="main-content">
 *     {children}
 *   </main>
 * </div>
 *
 * // Para personal de RH con navegación específica
 * <SideNav roleView="rh" />
 *
 * // En dashboard administrativo
 * <div className="admin-dashboard">
 *   <SideNav roleView="admin" />
 *   <div className="content-area">
 *     <AdminContent />
 *   </div>
 * </div>
 *
 * // Con navegación condicional por rol
 * <SideNav roleView={authenticatedUser.role} />
 * ```
 *
 * @see {@link NavLinks} - Componente que genera enlaces de navegación según el rol
 * @see {@link FAQ} - Componente de enlace a preguntas frecuentes
 * @see {@link ForLogOut} - Componente de botón de cierre de sesión
 */
export default function SideNav({ roleView }: SideNavProps) {
  return (
    <div className="flex h-full flex-col px-3 py-4 md:py-2 md:px-0 bg-white">
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-21">
        <div className="h-auto w-full grow rounded-4xl bg-[#0d324f] md:block flex flex-row">
          {/* Área del logotipo corporativo */}
          <div className="w-full flex items-center md:pl-6 md:pt-6 md:pr-8 md:pb-12 pl-4">
            <Image
              width={100}
              height={50}
              alt="Logo de Grupo Pissa"
              src="/logo-blanco.png"
            />
          </div>

          {/* Enlaces de navegación principales basados en rol */}
          <NavLinks roleView={roleView} />

          {/* Enlace fijo a FAQ en la parte inferior izquierda */}
          <Link href="faq">
            <div className="bottom-6 left-6 fixed p-3 items-center justify-center flex flex-col text-white hover:bg-[#2974a04b] rounded-xl">
              <FAQ />
            </div>
          </Link>

          {/* Botón fijo de cierre de sesión en la parte inferior */}
          <div className="bottom-6 left-48 fixed p-3 items-center justify-center flex flex-col text-white hover:bg-[#2974a04b] rounded-xl">
            <ForLogOut />
          </div>
        </div>
      </div>
    </div>
  );
}
