import { Menu } from "@/app/components/Navbar/navbar";
import "./page.css";

const tratamientos = [
    {
        id: "ginecologia",
        titulo: "Ginecología Funcional y Regenerativa",
        intro:
            "La ginecología funcional busca mirar más allá de los síntomas, entender cómo se relaciona tu cuerpo, tus hormonas, tus emociones y tus hábitos. Abordaje integral que busca el origen de los síntomas y acompaña cada etapa de la vida de la mujer",
        sintomas: [
            "Alteraciones hormonales",
            "Dolor o molestias persistentes",
            "Desequilibrios del ciclo",
        ],
        opciones: [
            {
                titulo: "Enfoque integral",
                descripcion:
                    "Un espacio pensado para acompañarte de manera integral, donde cada consulta tiene el tiempo que merece. Treinta minutos para hablar y entender lo que te pasa. A partir de ahí armamos juntas un plan claro y personalizado, con los pasos justos y el acompañamiento que necesitás en cada etapa",
            },
        ],
        beneficios: ["Visión integral", "Tratamiento personalizado", "Prevención"],
    },

    {
        id: "incontinencia",
        titulo: "Incontinencia de Orina",
        intro:
            "La incontinencia urinaria puede presentarse principalmente como de esfuerzo o de urgencia. La incontinencia de esfuerzo se debe a la debilidad del piso pélvico y provoca pérdidas al toser, hacer ejercicio o levantar peso. La incontinencia de urgencia está relacionada con una vejiga hiperactiva, generando una necesidad repentina e intensa de orinar. Cuando ambos tipos se combinan, se denomina incontinencia urinaria mixta",
        sintomas: [
            "Pérdidas al toser o hacer ejercicio",
            "Urgencia repentina",
            "Episodios combinados",
        ],
        opciones: [
            {
                titulo: "Dr. Arnold (DEKA)",
                descripcion:
                    "Sistema terapéutico no invasivo que a través de un aplicador en forma de silla, genera un campo electromagnético intenso y focalizado que atraviesa la ropa y los tejidos sin dolor, estimulando directamente los nervios y provocando contracciones musculares involuntarias de alta intensidad, superiores a los ejercicios de Kegel. Está indicado para el tratamiento de la incontinencia urinaria (de esfuerzo, urgencia o mixta), debilidad del piso pélvico —ya sea por postparto o por el paso del tiempo—, mejora de la tonicidad vaginal, disfunciones sexuales y prevención de prolapso. El protocolo consiste en 8 sesiones de 30 minutos, con una frecuencia de hasta 2 veces por semana, y requiere sesiones de mantenimiento cada 4 a 6 meses para sostener los resultados",
            },
            {
                titulo: "Láser Vaginal – IncontiLase® (Fotona)",
                descripcion:
                    "Tratamiento láser no invasivo e indoloro indicado para la incontinencia urinaria de esfuerzo y mixta leve a moderada. Se destaca por su alta eficacia en la reducción de los síntomas, contribuyendo a mejorar la tensión vaginal y la calidad de vida, sin necesidad de cirugía ni tiempos de recuperación. Actúa mediante un calentamiento suave y controlado del tejido vaginal, estimulando la remodelación y la producción de nuevo colágeno en la pared vaginal anterior y la zona uretral. El tratamiento consta de 3 a 4 sesiones, con intervalos de un mes entre cada una, y requiere una sesión de mantenimiento cada 6 meses para sostener los resultados",
            },
        ],
        beneficios: [
            "Mejor control urinario",
            "Mayor confianza",
            "Sin cirugía",
        ],
    },

    {
        id: "sequedad",
        titulo: "Sequedad Vaginal",
        intro:
            "La sequedad vaginal y el síndrome genitourinario de la menopausia son consecuencia de la disminución de los estrógenos, afectando la vagina, la vulva y las vías urinarias.Se trata de una condición crónica y progresiva si no se trata, que puede generar síntomas como sequedad, ardor, irritación, dolor en las relaciones sexuales, disminución de la lubricación y molestias urinarias como urgencia o infecciones recurrentes.Estos cambios se producen por el adelgazamiento del tejido vaginal, la pérdida de elasticidad, la disminución del colágeno y alteraciones en el pH, impactando directamente en la calidad de vida y el bienestar íntimo",
        sintomas: [
            "Sequedad vaginal",
            "Ardor o irritación",
            "Dolor en relaciones sexuales",
        ],
        opciones: [
            {
                titulo: "Lubricantes e Hidratantes Vaginales",
                descripcion: "Son una opción inicial o complementaria para el alivio de los síntomas leves de sequedad vaginal, aunque cumplen funciones diferentes y específicas. Los lubricantes se utilizan durante las relaciones sexuales, mejorando la fricción y disminuyendo el dolor, con un efecto inmediato pero de corta duración. Por otro lado, los hidratantes se utilizan de forma regular, favoreciendo la hidratación del tejido vaginal y mejorando la salud del epitelio a largo plazo. Si bien ayudan a aliviar los síntomas, no revierten la atrofia vaginal causada por la disminución de estrógenos. Por eso, es fundamental elegir el producto adecuado según su composición y siempre bajo recomendación profesional",
            },
            {
                titulo: "Terapia Hormonal de Reemplazo Local",
                descripcion:
                    "Es el tratamiento de primera elección para el síndrome genitourinario de la menopausia. Consiste en la aplicación local de estrógenos, prasterona o testosterona mediante óvulos o cremas, actuando directamente sobre el tejido vaginal con mínima absorción sistémica. Mejora significativamente la sequedad, el ardor, el dolor en las relaciones sexuales y los síntomas urinarios, restaurando la salud del tejido vaginal. Los óvulos suelen ser más prácticos y permiten una dosificación precisa, mientras que las cremas ofrecen la posibilidad de ajustar la dosis y son especialmente útiles cuando también hay compromiso del área vulvar. Se trata de un tratamiento crónico, por lo que su uso debe mantenerse en el tiempo para sostener los resultados",
            },
            {
                titulo: "Láser Vaginal – RenovaLase® (Fotona)",
                descripcion:
                    "Tratamiento láser no invasivo diseñado para tratar la atrofia vaginal asociada a la menopausia. Mediante pulsos suaves, estimula la regeneración de la mucosa vaginal, mejorando la lubricación y aliviando la sequedad y el malestar. Actúa generando un calentamiento controlado del tejido vaginal, lo que favorece la formación de nuevos vasos sanguíneos y la producción de colágeno. Como resultado, aumenta el grosor y la elasticidad del epitelio, reduciendo síntomas como sequedad, picazón, irritación y dolor en las relaciones sexuales. Se destaca por ofrecer resultados duraderos, que pueden mantenerse por más de un año sin necesidad de tratamientos continuos con cremas o geles, mejorando significativamente la calidad de vida. El tratamiento suele realizarse en 3 sesiones, con intervalos de un mes, no requiere preparación previa ni cuidados posteriores, y permite retomar las actividades diarias de forma inmediata",
            },
            {
                titulo: "Hidratación Vaginal con Ácido Hialurónico",
                descripcion:
                    "Tratamiento no hormonal que mejora la hidratación, elasticidad y confort del tejido vaginal. El ácido hialurónico tiene una alta capacidad de retener agua, favoreciendo la reparación de la mucosa y mejorando la calidad del tejido.Está indicado para sequedad vaginal, irritación, ardor y molestias durante las relaciones sexuales, siendo también una alternativa ideal en pacientes que no pueden o no desean utilizar terapia hormonal. Se aplica mediante microinyecciones en la zona vaginal y vulvar, con anestesia local. Es un procedimiento rápido que solo requiere reposo sexual durante 72 horas y cuyos resultados pueden durar entre 12 y 18 meses",
            },
        ],
        beneficios: [
            "Mayor confort",
            "Mejor calidad de vida",
            "Soluciones personalizadas",
        ],
    },

    {
        id: "rejuvenecimiento",
        titulo: "Rejuvenecimiento Vaginal",
        intro:
            "Tratamientos que mejoran la firmeza, elasticidad y funcionalidad del tejido vaginal",
        sintomas: [
            "Laxitud vaginal",
            "Disminución de sensibilidad",
            "Cambios postparto o edad",
        ],
        opciones: [
            {
                titulo: "IntimaLase® (Fotona)",
                descripcion:
                    "IntimaLase® es un tratamiento láser no invasivo diseñado para mejorar la firmeza y tensión vaginal, actuando tanto a nivel de la vagina como de la vulva. Mediante pulsos de láser suaves y controlados, produce un calentamiento del tejido que estimula la formación de nuevo colágeno y la reorganización de las fibras existentes, logrando un efecto de tensado y fortalecimiento de las estructuras. Está especialmente indicado en mujeres con laxitud vaginal, frecuentemente asociada al parto o al paso del tiempo, y ha demostrado mejorar la sensibilidad, el placer sexual y la calidad de vida. El tratamiento es seguro, indoloro y se realiza en sesiones breves. En la mayoría de los casos, se recomiendan 3 sesiones con intervalos mensuales para obtener resultados visibles y progresivos. No requiere preparación previa ni cuidados posteriores, y permite retomar las actividades cotidianas de forma inmediata, con una recuperación rápida y sin necesidad de medicación",
            },
        ],
        beneficios: [
            "Mayor firmeza",
            "Mejor bienestar íntimo",
            "Resultados progresivos",
        ],
    },
];

export default function TratamientosPage() {
    return (
        <>
            <Menu />

            {/* HERO */}
            <section className="hero-tratamiento d-flex align-items-center text-white">
                <div className="container text-center">
                    <h1 className="title tto-title">Tratamientos</h1>

                    {/* NAV INTERNO */}
                    <div className="mt-4 d-flex flex-wrap justify-content-center gap-3">
                        {tratamientos.map((t) => (
                            <a key={t.id} href={`#${t.id}`} className="anchor-link">
                                {t.titulo}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECCIONES */}
            {tratamientos.map((t, index) => (
                <section
                    key={t.id}
                    id={t.id}
                    className={`secciones-tto ${index % 2 === 0 ? "section-light" : ""}`}
                >
                    <div className="container px-5 container-tto">
                        <h2 className="mb-3 color-primary">{t.titulo}</h2>

                        <div className="row g-5 align-items-start">
                            {/* TEXTO */}
                            <div className="col-lg-7">
                                <p className="text-body-secondary">
                                    {t.intro.split(". ").map((linea, i) => (
                                        <span key={i}>
                                            {linea}.
                                            <br />
                                        </span>
                                    ))}
                                </p>
                            </div>

                            {/* SÍNTOMAS */}
                            <div className="col-lg-5">
                                <div className="symptoms-box p-4">
                                    <h5 className="mb-3">Síntomas frecuentes</h5>
                                    {t.sintomas.map((s, i) => (
                                        <p key={i} className="mb-2" >
                                            <span key={i} className="color-primary fw-semibold">✔ </span>
                                            {s}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* OPCIONES */}
                        <div className="mt-5">
                            <h5>Opciones de tratamiento</h5>
                            <div className="row g-4 mt-2">
                                {t.opciones.map((op, i) => (
                                    <div key={i} className="col-lg-6">
                                        <div className="card tto-card h-100">
                                            <h6 className="text-uppercase color-primary">{op.titulo}</h6>
                                            <p className="text-body-secondary">
                                                {op.descripcion.split(". ").map((linea, i) => (
                                                    <span key={i}>
                                                        {linea}.
                                                        <br />
                                                    </span>
                                                ))}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5">
                                <h5 className="text-center">Beneficios</h5>

                                <div className="d-flex flex-wrap justify-content-center gap-3 mt-4">
                                    {t.beneficios.map((b, i) => (
                                        <p key={i}  >
                                            <span key={i} className="color-primary fw-semibold">✔ </span>
                                            {b}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </div>


                    </div>
                </section>
            ))}

            {/* CTA FINAL */}
            <section className="py-5 text-center">
                <div className="container">
                    <h3>¿Querés mejorar tu bienestar íntimo?</h3>
                    <p className="text-body-secondary">
                        Consultá tu caso y encontrá el tratamiento ideal para vos
                    </p>

                     <button
                        className="btn-style btn-ttos ms-auto mx-2"
                    >
                        <a className="text-decoration-none text-white" href="https://miomedicina.sc3-server3.com.ar/miturno" target="_blank" rel="noopener noreferrer"> Agendar consulta</a>
                    </button>
                </div>
            </section>
        </>
    );
}