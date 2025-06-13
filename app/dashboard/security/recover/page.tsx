/**
 * security/recover/page.tsx
 *
 * Proporciona la página de recuperación de credenciales para usuarios del sistema.
 *
 * Esta página del módulo de seguridad presenta una interfaz administrativa para la
 * recuperación de credenciales para que usuarios del sistema de contrataciones puedan
 * volver a acceder a su cuenta en caso de haber olvidado su contraseña.
 * Componente ListUsers que maneja todo el proceso de recuperación de cuentas.
 */

import { urbanist } from "@/app/components/fonts";
import ListUsers from "@/app/components/recoverAccount";

export default function recoverAccount() {
  return (
    <>
      <h1
        className={`${urbanist.className} text-4xl text-[#212529] pl-4 mb-4 animate-fade-in-up`}
      >
        <strong>Recuperación de Contraseñas</strong>
      </h1>
      <ListUsers />
    </>
  );
}
