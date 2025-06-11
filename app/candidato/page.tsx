/**
 * candidato/page.tsx
 *
 * Componente de página principal de bienvenida para candidatos.
 *
 * Esta página actúa como dashboard principal para candidatos autenticados,
 * mostrando un saludo personalizado basado en la hora del día y el componente
 * de proceso de candidato que presenta información relevante sobre el estado
 * actual de su expediente y próximos pasos en el proceso de contratación.
 */

import Proceso from "../components/candidatoBienvenida";
import { urbanist } from "../components/fonts";

/**
 * Función auxiliar para generar saludo contextual basado en la hora del día.
 *
 * Determina el saludo apropiado según la hora actual del sistema:
 * - 6:00 - 11:59: "Buenos días"
 * - 12:00 - 18:59: "Buenas tardes"
 * - 19:00 - 5:59: "Buenas noches"
 *
 * @returns string - Saludo apropiado para la hora actual
 *
 * @example
 * ```ts
 * // A las 9:00 AM
 * obtenerSaludo(); // "Buenos días"
 *
 * // A las 3:00 PM
 * obtenerSaludo(); // "Buenas tardes"
 *
 * // A las 10:00 PM
 * obtenerSaludo(); // "Buenas noches"
 * ```
 */
function obtenerSaludo(): string {
  const hora = new Date().getHours();
  if (hora >= 6 && hora < 12) return "Buenos días";
  if (hora >= 12 && hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

/**
 * @see {@link Proceso} Componente que muestra información del proceso de candidato
 * @see {@link obtenerSaludo} Función para generar saludos contextuales
 */
export default function Bienvenida() {
  return (
    <div className="space-y-6">
      <h1
        className={`${urbanist.className} text-4xl font-bold animate-fade-in-up text-[#212529]`}
      >
        {obtenerSaludo()}
      </h1>
      <Proceso />
    </div>
  );
}
