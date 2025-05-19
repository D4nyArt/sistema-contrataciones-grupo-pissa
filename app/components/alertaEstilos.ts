export const estilosClasificacion = {
  aprobado: {
    alerta: "bg-green-500",
    input: "border-green-500 text-green-600 placeholder-green-400",
  },
  denegado: {
    alerta: "bg-red-500",
    input: "border-red-500 text-red-600 placeholder-red-400",
  },
  errorSist: {
    alerta: "bg-red-800",
    input: "border-red-800 text-red-800 placeholder-red-700",
  },
  info: {
    alerta: "bg-blue-500",
    input: "border-blue-500 text-blue-600 placeholder-blue-400",
  },
} as const;
