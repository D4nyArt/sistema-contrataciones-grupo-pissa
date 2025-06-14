/**
 * [id]/page.tsx
 *
 * Proporciona la página de información detallada de usuario con ID dinámico.
 *
 * Esta página del sistema de rutas dinámicas de Next.js renderiza la información
 * completa de un usuario específico basándose en el parámetro de ID extraído de
 * la URL. Actúa como contenedor principal para el componente UserInfo que maneja
 * la lógica de presentación de datos, navegación por pestañas y funcionalidades
 * administrativas como revisión de expedientes y gestión de contratos.
 */

import UserInfo from "@/app/components/userinfo";
export default async function UserInformation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <UserInfo id={id} />
    </div>
  );
}
