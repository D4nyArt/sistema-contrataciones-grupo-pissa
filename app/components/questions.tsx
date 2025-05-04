export default function Questions(){
    const faqs = [
        {
          pregunta: "¿Cómo ingreso por primera vez?",
          respuesta: "Puedes registrarte ingresando al portal e ingresando las credenciales que se te proporcionaron."
        },
        {
          pregunta: "¿Cómo recupero mi contraseña?",
          respuesta: "Puedes solicitar la recuperación en “Olvidaste tu contraseña?”, donde te contactaremos por correo y aprobaremos tu cambio de contraseña."
        },
        {
          pregunta: "¿Puedo editar mi información personal?",
          respuesta: "Sí, dentro de tu perfil encontrarás una opción para editar tus datos."
        },
      ]
    
    return(
        <div className="w-full px-6 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-md p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-[#001e2b]">{faq.pregunta}</h3>
                    <p className="text-sm text-gray-600 mt-2">{faq.respuesta}</p>
                </div>
                ))}
            </div>
        </div>

    )
}