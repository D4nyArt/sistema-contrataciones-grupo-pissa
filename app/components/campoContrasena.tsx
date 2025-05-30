/* DOCUMENTACIÓN - Contraseñas

PROPIEDADES
value: contraseña
onChange: si hay cambios en el input
placeholder: texto descriptivo (default: "Contraseña") **OPCIONAL**
error: contorno rojo si hay error **OPCIONAL**
required: por si el campo es obligatorio (default: true) **OPCIONAL**
*/

"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PropContrasena {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
  required?: boolean;
}

export function CampoContrasena({
  value,
  onChange,
  placeholder = "Contraseña",
  required = true,
  className = ""
}: PropContrasena) {
  const [mostrarContrasena, setMostrarContrasena] = useState(false);

  return (
    <div className="mb-4 relative">
      <input
        type={mostrarContrasena ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full p-2 
          border border-gray-300 rounded-lg 
          mt-1 bg-[#fafbfc] text-black  ${className}`}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => setMostrarContrasena(!mostrarContrasena)}
          aria-label={
            mostrarContrasena ? "Ocultar contraseña" : "Mostrar contraseña"
          }
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
        >
          {mostrarContrasena ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
}
