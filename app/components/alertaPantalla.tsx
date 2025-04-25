/* DOCUMENTACIÓN - Alertas en la Pantalla

CLASIFICACIÓN
- aprobado: verde
- denegado: rojo
- errorSist: rojo oscuro
- info: azul
 
PROPIEDADES
tipo: clasificación
mensaje: ""
cierreAuto: si se cierra automáticamente (tiempo) **OPCIONAL**
tiempo: tiempo en ms para cerrar **OPCIONAL**
funCerrar: funcion que se ejecuta al cerrar **OPCIONAL**
*/

"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

type clasifAlerta = "aprobado" | "denegado" | "errorSist" | "info";

interface propAlerta {
  tipo: clasifAlerta; // Clasificación
  mensaje: string;
  cierreAuto?: boolean;
  tiempo?: number; // Tiempo en pantalla en milisegs
  funCerrar?: () => void; // Alguna función para ejecutar cuando se cierra
}

/*Esto es un tipo de constructor */
export function Alerta({
  tipo,
  mensaje,
  cierreAuto = false,
  tiempo = 5000,
  funCerrar,
}: /*******************************************/

propAlerta) {
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

  const estilosClasificacion = {
    aprobado: "bg-green-500",
    denegado: "bg-red-500",
    errorSist: "bg-red-800",
    info: "bg-blue-500",
  };

  return (
    <div className={`${estiloBase} ${estilosClasificacion[tipo]}`}>
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
