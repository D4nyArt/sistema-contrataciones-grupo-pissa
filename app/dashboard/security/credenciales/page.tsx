/**
 * security/credenciales/page.tsx
 *
 * Proporciona la página de creación de credenciales para nuevos usuarios del sistema.
 *
 * Esta página del módulo de seguridad presenta una interfaz administrativa para la
 * creación de credenciales de acceso para nuevos usuarios del sistema de contrataciones.
 * Componente CreateCredentials que maneja todo el proceso de registro,
 * validación y configuración inicial de cuentas. Optimizada para uso exclusivo del
 * personal administrativo con permisos de gestión de usuarios.
 */

import CreateCredentials from "@/app/components/createcredentials";
import { urbanist } from "@/app/components/fonts";

export default function Credentials() {
  return (
    <div className="overflow-y-auto md:mt-0 flex-col flex">
      <h1
        className={`${urbanist.className} text-4xl text-[#212529] pl-4 mb-4 animate-fade-in-up`}
      >
        <strong>Creación de Credenciales</strong>
      </h1>
      <CreateCredentials />
    </div>
  );
}
