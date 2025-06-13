/**
 * candidatos/page.tsx
 *
 * Proporciona la página principal de gestión y visualización de candidatos del sistema.
 *
 * Esta página del dashboard administrativo presenta una interfaz completa para la
 * gestión de candidatos registrados en el sistema de contrataciones. Incluye un
 * título prominente con tipografía corporativa y el componente principal ListUsers
 * que maneja toda la funcionalidad de listado, búsqueda, filtrado y acciones
 * administrativas sobre los candidatos. Optimizada para uso por parte del personal
 * de Recursos Humanos en la supervisión del proceso de reclutamiento.
 */

import { urbanist } from "@/app/components/fonts";
import ListUsers from "@/app/components/lista-candidatos";

export default function Candidatos() {
  return (
    <>
      <h1
        className={`${urbanist.className} text-4xl text-[#212529] pl-4 mb-4 animate-fade-in-up`}
      >
        <strong>Candidatos</strong>
      </h1>
      <ListUsers />
    </>
  );
}
