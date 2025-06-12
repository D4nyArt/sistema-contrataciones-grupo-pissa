/**
 * alertaPantalla.tsx
 *
 * Proporciona un componente de alerta personalizable para mostrar notificaciones en pantalla.
 *
 * Este módulo incluye un componente de alerta que soporta diferentes tipos de clasificación
 * (aprobado, denegado, error del sistema, información) con estilos correspondientes. Incluye
 * funcionalidad de cierre automático, cierre manual y ejecución de callbacks personalizados.
 */

"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { estilosClasificacion } from "./alertaEstilos";

/**
 * Define los tipos de clasificación disponibles para las alertas.
 *
 * - aprobado: Alerta verde para acciones exitosas
 * - denegado: Alerta roja para acciones denegadas
 * - errorSist: Alerta roja oscura para errores del sistema
 * - info: Alerta azul para información general
 */
type clasifAlerta = "aprobado" | "denegado" | "errorSist" | "info";

/**
 * Define las propiedades del componente de alerta.
 */
interface propAlerta {
  /** El tipo de clasificación que determina el estilo visual de la alerta. */
  tipo: clasifAlerta;

  /** El mensaje de texto que se mostrará en la alerta. */
  mensaje: string;

  /** Indica si la alerta se debe cerrar automáticamente después de un tiempo determinado. */
  cierreAuto?: boolean;

  /** Tiempo en milisegundos antes de que la alerta se cierre automáticamente. Por defecto 5000ms. */
  tiempo?: number;

  /** Función callback que se ejecuta cuando la alerta se cierra, ya sea manual o automáticamente. */
  funCerrar?: () => void;
}

/**
 * Renderiza un componente de alerta con estilos personalizables y funcionalidad de cierre.
 *
 * Este componente muestra una alerta con diferentes estilos según su clasificación,
 * permite cierre manual mediante un botón X, y opcionalmente puede cerrarse
 * automáticamente después de un tiempo especificado.
 *
 * @param props - Las propiedades del componente de alerta.
 * @param props.tipo - El tipo de clasificación que determina el estilo visual.
 * @param props.mensaje - El mensaje de texto a mostrar.
 * @param props.cierreAuto - Si la alerta se cierra automáticamente (por defecto false).
 * @param props.tiempo - Tiempo en milisegundos para cierre automático (por defecto 5000).
 * @param props.funCerrar - Función a ejecutar al cerrar la alerta.
 * @returns El elemento JSX que renderiza la alerta.
 *
 * @example
 * ```tsx
 * // Alerta de éxito con cierre automático
 * <Alerta
 *   tipo="aprobado"
 *   mensaje="Operación completada exitosamente"
 *   cierreAuto={true}
 *   tiempo={3000}
 *   funCerrar={() => console.log("Alerta cerrada")}
 * />
 *
 * // Alerta de error que requiere cierre manual
 * <Alerta
 *   tipo="errorSist"
 *   mensaje="Error del sistema: No se pudo conectar al servidor"
 *   funCerrar={handleCloseAlert}
 * />
 *
 * // Alerta informativa simple
 * <Alerta
 *   tipo="info"
 *   mensaje="Información importante para el usuario"
 * />
 * ```
 *
 * @see {@link estilosClasificacion} - Objeto que contiene los estilos CSS para cada tipo de alerta
 */
export function Alerta({
  tipo,
  mensaje,
  cierreAuto = false,
  tiempo = 5000,
  funCerrar,
}: propAlerta) {
  useEffect(() => {
    if (cierreAuto) {
      const timer = setTimeout(() => {
        if (funCerrar) funCerrar();
      }, tiempo);
      return () => clearTimeout(timer);
    }
  }, [cierreAuto, tiempo, funCerrar]);

  const estiloBase =
    "p-4 rounded-lg shadow-lg flex items-center justify-between gap-2 text-white";

  return (
    <div className={`${estiloBase} ${estilosClasificacion[tipo].alerta}`}>
      <span>{mensaje}</span>
      <button
        onClick={funCerrar}
        className="ml-2 hover:opacity-80 transition-opacity"
        aria-label="Cerrar alerta"
      >
        <X size={16} />
      </button>
    </div>
  );
}
