/**
 * candidato/perfil/page.tsx
 *
 * Componente de página del perfil del candidato.
 *
 * Esta página permite a los candidatos visualizar y editar su información
 * personal completa, incluyendo datos de contacto, información laboral,
 * preferencias y configuraciones de cuenta. Actúa como interfaz principal
 * para la gestión del perfil personal del candidato dentro del sistema
 * de contrataciones, delegando la funcionalidad específica al componente
 * Profile reutilizable.
 */

import React from "react";
import Profile from "@/app/components/profile";

export default function ProfilePage() {
  return <Profile />;
}
