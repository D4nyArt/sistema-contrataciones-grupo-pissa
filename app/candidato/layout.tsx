/**
 * candidato/layout.tsx
 *
 * Componente de layout específico para la sección de candidatos.
 *
 * Este layout define la estructura visual y navegacional para todas las páginas
 * dentro de la sección /candidato. Proporciona una interfaz adaptativa con
 * navegación lateral para escritorio y navegación inferior para dispositivos
 * móviles, configurada específicamente para el rol de candidato con sus
 * opciones y permisos correspondientes.
 */

import MenuPhone from "../components/menu-phone";
import SideNav from "../components/sidenav";
import SideNavPhone from "../components/sidenav-phone";

/**
 * @see {@link SideNav} Componente de navegación lateral para escritorio
 * @see {@link SideNavPhone} Componente de navegación inferior para móviles
 * @see {@link MenuPhone} Componente de menú hamburguesa para móviles
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  const role = "candidato";

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden bg-white">
      {/* Navegación lateral para escritorio */}
      <div className="w-full flex-none md:w-64 pl-2 bg-white md:block hidden animate-fade-in-left">
        <SideNav roleView={role} />
      </div>

      {/* Área de contenido principal */}
      <div className="flex-grow md:overflow-y-auto p-6 md:p-12 bg-gray-50 md:bg-[#f5f7fb] md:m-2 md:rounded-4xl overflow-x-auto pb-24 md:pb-0">
        {children}
      </div>

      {/* Navegación inferior para móviles */}
      <div className="h-20 w-full fixed bottom-0 bg-gray-50 md:hidden block p-2">
        <SideNavPhone roleView={role} />
      </div>

      {/* Menú hamburguesa flotante para móviles */}
      <div className="fixed top-6 right-5 md:hidden">
        <MenuPhone />
      </div>
    </div>
  );
}
