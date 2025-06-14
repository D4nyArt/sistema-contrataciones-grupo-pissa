/**
 * fondo-blanco.tsx
 *
 * Proporciona un contenedor con fondo blanco y bordes redondeados para elementos de UI.
 *
 * Este componente funciona como un wrapper visual que aplica un estilo consistente
 * de fondo blanco con bordes muy redondeados y padding interno. Diseñado para crear
 * secciones destacadas, modales, formularios o cualquier contenido que requiera
 * separación visual del fondo de la aplicación con un diseño limpio y moderno.
 */

/**
 * Define las propiedades del componente FondoBlanco.
 */
interface FondoBlancoProps {
  /** Los elementos hijos que se renderizarán dentro del contenedor con fondo blanco. */
  children: React.ReactNode;
}

/**
 * Renderiza un contenedor con fondo blanco, bordes redondeados y padding para elementos UI.
 *
 * Este componente wrapper proporciona un estilo visual consistente para crear
 * secciones destacadas dentro de la aplicación. Aplica un fondo blanco sólido,
 * bordes extremadamente redondeados (rounded-4xl) y padding generoso para crear
 * una separación visual clara del contenido circundante, ideal para formularios,
 * modales, tarjetas de contenido o secciones importantes.
 *
 * @param props - Las propiedades del componente.
 * @param props.children - Los elementos hijos a renderizar dentro del contenedor.
 * @returns El elemento JSX que renderiza el contenedor con fondo blanco.
 *
 * @example
 * ```tsx
 * // Wrapper para formulario de login
 * <FondoBlanco>
 *   <LoginForm />
 * </FondoBlanco>
 *
 * // Contenedor para modal
 * <FondoBlanco>
 *   <h2>Título del Modal</h2>
 *   <p>Contenido del modal...</p>
 *   <ModalActions />
 * </FondoBlanco>
 *
 * // Sección destacada de contenido
 * <FondoBlanco>
 *   <UserProfile />
 *   <UserActions />
 * </FondoBlanco>
 * ```
 */
export default function FondoBlanco({ children }: Readonly<FondoBlancoProps>) {
  return (
    <div className="bg-white rounded-4xl p-10 items-center">{children}</div>
  );
}
