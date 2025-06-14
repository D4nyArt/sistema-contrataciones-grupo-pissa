/**
 * preventBFCache.tsx
 *
 * Proporciona funcionalidad para prevenir problemas del Back/Forward Cache del navegador.
 *
 * Este componente maneja automáticamente la recarga de la página cuando el navegador
 * restaura la página desde el Back/Forward Cache (BFCache). Esto es especialmente
 * importante para aplicaciones con autenticación y estados sensibles que requieren
 * datos actualizados y validación de sesión cada vez que el usuario navega a la página.
 */

"use client";

import { useEffect } from "react";

/**
 * Renderiza un componente invisible que previene problemas del Back/Forward Cache.
 *
 * Este componente se encarga de detectar cuando el navegador restaura una página
 * desde el Back/Forward Cache y fuerza una recarga completa para asegurar que:
 * - Los estados de autenticación se validen correctamente
 * - Los datos sensibles estén actualizados
 * - Los componentes se inicialicen con información fresca
 * - Se eviten inconsistencias en el estado de la aplicación
 *
 * El componente no renderiza contenido visual, actúa como un hook de efecto
 * global que mantiene la integridad del estado de la aplicación.
 *
 * @returns null - No renderiza contenido visual alguno.
 *
 * @example
 * ```tsx
 * // Uso en layout principal de la aplicación
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <PreventBFCache />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 *
 * // Uso en páginas con autenticación sensible
 * export default function LoginPage() {
 *   return (
 *     <div>
 *       <PreventBFCache />
 *       <LoginForm />
 *     </div>
 *   );
 * }
 *
 * // En dashboard de usuario
 * export default function Dashboard() {
 *   return (
 *     <div>
 *       <PreventBFCache />
 *       <UserContent />
 *     </div>
 *   );
 * }
 * ```
 */
export default function PreventBFCache() {
  useEffect(() => {
    /**
     * Maneja el evento pageshow para detectar restauración desde BFCache.
     *
     * Esta función se ejecuta cada vez que se muestra la página y verifica
     * si la página fue restaurada desde el Back/Forward Cache mediante la
     * propiedad 'persisted' del evento. Si detecta que la página viene del
     * cache, fuerza una recarga completa para mantener la integridad de los
     * datos y el estado de autenticación.
     *
     * @param event - El evento PageTransitionEvent que contiene información sobre cómo se cargó la página.
     */
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    // Registrar el listener para el evento pageshow
    window.addEventListener("pageshow", handlePageShow);

    // Cleanup: remover el listener cuando el componente se desmonte
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // No renderiza contenido visual
  return null;
}
