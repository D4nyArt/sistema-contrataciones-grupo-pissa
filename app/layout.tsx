/**
 * candidato/layout.tsx
 *
 * Componente de layout específico para la sección de recursos humanos.
 *
 * Este layout define la estructura visual y navegacional para todas las páginas
 * dentro de la sección /dashboard. Proporciona una interfaz adaptativa con
 * navegación lateral para escritorio y navegación inferior para dispositivos
 * móviles, configurada específicamente para el rol de rh con sus
 * opciones y permisos correspondientes.
 */

import PreventBFCache from "./components/preventBFCache";
import "./globals.css";
import { poppins } from "@/app/components/fonts";

/**
 * @see {@link PreventBFCache} - Componente que previene problemas de cache del navegador
 */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${poppins.className}`}>
        <PreventBFCache />
        {/* Área de contenido principal */}
        {children}
      </body>
    </html>
  );
}
