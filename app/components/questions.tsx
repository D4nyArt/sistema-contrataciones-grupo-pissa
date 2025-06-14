/**
 * questions.tsx
 *
 * Proporciona una interfaz de visualización de preguntas frecuentes con funcionalidad de búsqueda.
 *
 * Este componente presenta una colección de preguntas frecuentes (FAQ) organizadas en
 * un diseño de tarjetas responsivo. Incluye funcionalidad de filtrado en tiempo real
 * que permite a los usuarios buscar preguntas específicas por contenido tanto en
 * la pregunta como en la respuesta, facilitando el acceso rápido a información
 * relevante de soporte y ayuda del sistema.
 */

/**
 * Renderiza una interfaz de preguntas frecuentes con capacidad de búsqueda y filtrado.
 *
 * Este componente muestra una colección predefinida de preguntas frecuentes en un
 * diseño de grid responsivo. Implementa funcionalidad de búsqueda en tiempo real
 * que filtra las preguntas según el término ingresado, buscando coincidencias tanto
 * en el texto de la pregunta como en la respuesta. La búsqueda es insensible a
 * mayúsculas/minúsculas y permite búsquedas parciales para mejorar la experiencia
 * del usuario al encontrar información específica.
 *
 * @param props - Las propiedades del componente.
 * @param props.searchTerm - El término de búsqueda para filtrar las preguntas frecuentes.
 * @returns El elemento JSX que renderiza las preguntas frecuentes filtradas.
 *
 * @example
 * ```tsx
 * // Uso en página de FAQ con búsqueda
 * const [searchTerm, setSearchTerm] = useState("");
 *
 * <div className="faq-page">
 *   <input
 *     type="text"
 *     placeholder="Buscar preguntas..."
 *     value={searchTerm}
 *     onChange={(e) => setSearchTerm(e.target.value)}
 *   />
 *   <Questions searchTerm={searchTerm} />
 * </div>
 *
 * // Uso sin filtro (mostrar todas las preguntas)
 * <Questions searchTerm="" />
 *
 * // Con término de búsqueda específico
 * <Questions searchTerm="contraseña" />
 * ```
 */
interface QuestionsProps {
  searchTerm: string;
}

export default function Questions({ searchTerm }: QuestionsProps) {
  /** Colección estática de preguntas frecuentes del sistema. */
  const faqs = [
    {
      pregunta: "¿Cómo ingreso por primera vez?",
      respuesta:
        "Puedes registrarte ingresando al portal e ingresando las credenciales que se te proporcionaron.",
    },
    {
      pregunta: "¿Cómo recupero mi contraseña?",
      respuesta:
        'Puedes solicitar la recuperación en "Olvidaste tu contraseña?", donde te contactaremos por correo y aprobaremos tu cambio de contraseña.',
    },
    {
      pregunta: "¿Puedo editar mi información personal?",
      respuesta:
        "Sí, dentro de tu perfil encontrarás una opción para editar tus datos.",
    },
  ];

  /**
   * Lista filtrada de preguntas frecuentes según el término de búsqueda.
   *
   * Esta función aplica filtrado en tiempo real sobre la colección de FAQs,
   * buscando coincidencias tanto en el texto de la pregunta como en la respuesta.
   * La búsqueda es insensible a mayúsculas/minúsculas y soporta búsquedas parciales.
   */
  const filteredFaqs = faqs.filter((faq) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      faq.pregunta.toLowerCase().includes(lowerSearch) ||
      faq.respuesta.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div className="w-full px-6 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {filteredFaqs.map((faq, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md p-6 border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-[#001e2b]">
              {faq.pregunta}
            </h3>
            <p className="text-sm text-gray-600 mt-2">{faq.respuesta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
