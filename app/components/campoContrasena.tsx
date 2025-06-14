/**
 * campoContrasena.tsx
 *
 * Proporciona un campo de entrada de contraseña con funcionalidad de mostrar/ocultar.
 *
 * Este componente renderiza un input de contraseña con un botón toggle para mostrar
 * u ocultar el contenido. Incluye estilos personalizables, validación opcional y
 * soporte para diferentes placeholders. El botón de visibilidad solo aparece cuando
 * hay contenido en el campo.
 */

"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Define las propiedades del componente de campo de contraseña.
 */
interface PropContrasena {
  /** El valor actual de la contraseña. */
  value: string;

  /** Función callback que se ejecuta cuando cambia el valor del input. */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  /** Texto placeholder del input. Por defecto "Contraseña". */
  placeholder?: string;

  /** Indica si el campo tiene un error (aplica estilos de error). */
  error?: boolean;

  /** Clases CSS adicionales para personalizar el estilo. */
  className?: string;

  /** Indica si el campo es obligatorio. Por defecto true. */
  required?: boolean;
}

/**
 * Renderiza un campo de entrada de contraseña con funcionalidad de mostrar/ocultar.
 *
 * Este componente proporciona una interfaz de usuario intuitiva para la entrada de contraseñas,
 * incluyendo un botón toggle que permite al usuario alternar entre mostrar y ocultar el
 * contenido de la contraseña. El botón de visibilidad solo aparece cuando hay texto ingresado.
 *
 * @param props - Las propiedades del componente.
 * @param props.value - El valor actual de la contraseña.
 * @param props.onChange - Función que maneja los cambios en el input.
 * @param props.placeholder - Texto placeholder (por defecto "Contraseña").
 * @param props.error - Si el campo tiene error visual.
 * @param props.className - Clases CSS adicionales.
 * @param props.required - Si el campo es obligatorio (por defecto true).
 * @returns El elemento JSX que renderiza el campo de contraseña.
 *
 * @example
 * ```tsx
 * // Uso básico
 * <CampoContrasena
 *   value={password}
 *   onChange={(e) => setPassword(e.target.value)}
 * />
 *
 * // Con placeholder personalizado y opcional
 * <CampoContrasena
 *   value={confirmPassword}
 *   onChange={(e) => setConfirmPassword(e.target.value)}
 *   placeholder="Confirmar contraseña"
 *   required={false}
 * />
 *
 * // Con indicador de error
 * <CampoContrasena
 *   value={password}
 *   onChange={handlePasswordChange}
 *   error={passwordError}
 *   className="border-red-500"
 * />
 * ```
 */
export function CampoContrasena({
  value,
  onChange,
  placeholder = "Contraseña",
  required = true,
  className = "",
}: PropContrasena) {
  /** Estado que controla si la contraseña está visible o no. */
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
