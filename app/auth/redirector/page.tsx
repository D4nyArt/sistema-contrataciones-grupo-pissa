/**
 * redirector/page.tsx
 *
 * Componente de página de redirección para manejo de autenticación.
 *
 * Este componente implementa una página invisible que sirve como punto intermedio
 * en el flujo de autenticación del sistema. Se utiliza como destino temporal
 * durante procesos de redirección automática, validación de sesiones o como
 * fallback en casos donde se requiere procesamiento adicional antes de mostrar
 * la interfaz final al usuario.
 */

/**
 * Componente funcional de página de redirección.
 *
 * Renderiza una página completamente vacía (null) que actúa como punto de
 * paso en el flujo de navegación de autenticación. Este patrón es común
 * para manejar redirecciones automáticas, validaciones de sesión o como
 * componente temporal mientras se procesa la lógica de autenticación.
 *
 * Casos de uso típicos:
 * - Redirección automática después de login/logout
 * - Validación de tokens de sesión antes de mostrar contenido
 * - Punto intermedio para procesamiento de autenticación
 * - Fallback durante transiciones de estado de autenticación
 *
 * Características:
 * - No renderiza contenido visual (return null)
 * - Página completamente invisible al usuario
 * - Permite que otros procesos (useEffect, middleware) manejen la lógica
 * - Evita parpadeos o contenido no deseado durante redirecciones
 *
 * @returns null - No renderiza ningún contenido visual
 *
 * @example
 * ```tsx
 * // Navegación típica:
 * // /login -> /auth/redirector -> /dashboard (después de validación)
 * //
 * // En el router o componente padre:
 * // useEffect(() => {
 * //   if (isAuthenticated) {
 * //     router.push('/dashboard');
 * //   } else {
 * //     router.push('/login');
 * //   }
 * // }, [isAuthenticated]);
 * ```
 *
 * @see {@link /login} Página de inicio de sesión
 * @see {@link /dashboard} Página principal después de autenticación
 */
export default function RedirectorPage() {
  return null;
}
