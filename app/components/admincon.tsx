/**
 * admincon.tsx
 *
 * Proporciona una interfaz administrativa para la gestión de contratos de usuarios.
 *
 * Este componente renderiza una vista de administración que permite a los usuarios
 * con permisos administrativos ver y gestionar información de contratos. Actúa como
 * un contenedor que organiza los componentes relacionados con la administración
 * de contratos.
 */

import ContractInfoView from "./contractinfoview";

/**
 * Renderiza la página de administración de contratos para un usuario específico.
 *
 * Este componente proporciona una interfaz administrativa que muestra información
 * detallada sobre los contratos de un usuario. Se utiliza principalmente por
 * personal administrativo para revisar, aprobar o gestionar contratos de candidatos.
 *
 * @param props - Las propiedades del componente.
 * @param props.uid - El ID único del usuario cuyos contratos se van a administrar.
 * @returns El elemento JSX que renderiza la página de administración de contratos.
 *
 * @example
 * ```tsx
 * // Renderizar la página de administración para un usuario específico
 * <AdminContractsPage uid="abc123" />
 * ```
 *
 * @see {@link ContractInfoView} - Componente que muestra la información detallada del contrato
 */
export default function AdminContractsPage({ uid }: { uid: string }) {
  return (
    <div className="mb-12">
      <div>
        <ContractInfoView id={uid} />
      </div>
    </div>
  );
}
