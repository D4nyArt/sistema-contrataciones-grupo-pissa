/**
 * profile-picture.tsx
 *
 * Proporciona un avatar circular personalizable con iniciales del usuario.
 *
 * Este componente genera automáticamente un avatar visual usando la primera letra
 * del nombre del usuario sobre un fondo circular. Ofrece personalización completa
 * de dimensiones y tamaño de texto, sirviendo como sustituto visual cuando no
 * hay imagen de perfil disponible. Ideal para interfaces de usuario, listas de
 * contactos y elementos de identificación visual rápida.
 */

/**
 * Renderiza un avatar circular con las iniciales del usuario.
 *
 * Este componente crea un avatar visual personalizable que extrae automáticamente
 * la primera letra del nombre proporcionado y la muestra centrada en un círculo
 * con fondo gris. Las dimensiones y el tamaño del texto son completamente
 * configurables mediante clases de Tailwind CSS, permitiendo su uso en diferentes
 * contextos como navegación, listas de usuarios, tarjetas de perfil o cualquier
 * elemento que requiera identificación visual rápida del usuario.
 *
 * @param nombre - El nombre del usuario para generar las iniciales.
 * @param width - Clase CSS para el ancho del avatar (ej: "w-8", "w-12").
 * @param height - Clase CSS para la altura del avatar (ej: "h-8", "h-12").
 * @param textSize - Clase CSS para el tamaño del texto (ej: "text-sm", "text-lg").
 * @returns El elemento JSX que renderiza el avatar circular con iniciales.
 *
 * @example
 * ```tsx
 * // Avatar pequeño para navegación
 * <ProfilePicture
 *   nombre="Juan Pérez"
 *   width="w-8"
 *   height="h-8"
 *   textSize="text-sm"
 * />
 *
 * // Avatar mediano para lista de usuarios
 * <ProfilePicture
 *   nombre="María García"
 *   width="w-12"
 *   height="h-12"
 *   textSize="text-base"
 * />
 *
 * // Avatar grande para perfil
 * <ProfilePicture
 *   nombre="Carlos López"
 *   width="w-20"
 *   height="h-20"
 *   textSize="text-2xl"
 * />
 * ```
 */
export default function ProfilePicture({
  nombre,
  width,
  height,
  textSize,
}: {
  nombre: string;
  width: string;
  height: string;
  textSize: string;
}) {
  /**
   * Extrae la inicial del nombre para mostrar en el avatar.
   *
   * Esta función procesa el nombre proporcionado para obtener la primera
   * letra del primer nombre. Si el nombre está vacío o no es válido,
   * retorna "??" como fallback visual. La inicial se convierte automáticamente
   * a mayúscula para mantener consistencia visual.
   *
   * @param name - El nombre completo del usuario.
   * @returns La inicial en mayúscula o "??" si el nombre no es válido.
   */
  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    const first = parts[0] ? parts[0][0] : "";
    return `${first}`.toUpperCase();
  };

  return (
    <div
      className={`${width} ${height} ${textSize} bg-gray-400 rounded-full flex items-center justify-center text-white font-bold`}
    >
      {getInitials(nombre)}
    </div>
  );
}
