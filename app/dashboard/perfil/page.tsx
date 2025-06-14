/**
 * perfil/page.tsx
 *
 * Proporciona la página de perfil personal del usuario autenticado en el sistema.
 *
 * Esta página del dashboard presenta la interfaz de gestión del perfil personal
 * donde los usuarios pueden visualizar y editar su información personal. Actúa
 * como contenedor principal para el componente Profile que maneja toda la lógica
 * de presentación de datos personales, edición de información, carga de avatar
 * y gestión de configuraciones de cuenta. Optimizada para proporcionar una
 * experiencia centralizada de autogestión de perfil.
 */

import React from "react";
import Profile from "@/app/components/profile";

export default function ProfilePage() {
  return <Profile />;
}
