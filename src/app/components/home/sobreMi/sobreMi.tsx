import React from 'react';
import './sobreMi.css';

const SobreMi = () => {
    return (
        <section className="overflow-hidden section-sobre-mi" id="sobre-mi">
            <div className="d-flex flex-column flex-lg-row gap-16 align-items-center">
                {/* IMAGEN SOLO VISIBLE EN DESKTOP */}
                <div className="d-none d-md-block w-lg-50 mx-auto">
                    <img
                        className="rounded-2rem z-10 w-100 "
                        alt="Dra. Barbieri Florencia"
                        src="/images/sobre_mi_desktop.jpg"
                    />
                </div>
                <div className="w-100 w-lg-50 space-y-8">
                    <div className="d-flex flex-row align-items-center gap-3">
                        {/* IMAGEN SOLO VISIBLE EN MOBILE */}
                        <img
                            className="d-block d-md-none rounded-circle shadow-lg img-fluid size-40 object-fit-cover"
                            alt="Dra. Barbieri Florencia"
                            src="/images/sobre_mi_mobile.jpg"
                        />
                        <div className="d-flex flex-column">
                            <h2 className="text-primary fw-bold tracking-widest text-uppercase fs-6">Sobre mí</h2>
                            <h3 className="title">Dra. Barbieri Florencia</h3>
                        </div>
                    </div>
                    <p className="fs-4 font-serif fst-italic text-slate-500">Especialista en Ginecología Funcional y Regenerativa</p>
                    <div className="leading-relaxed">
                        <p>Soy médica especialista en Ginecología y Obstetricia, con una trayectoria orientada a la evolución constante de la salud femenina y al abordaje integral de cada etapa de la vida de la mujer.</p>
                        <p>Mi camino hacia la ginecología funcional, regenerativa y estética surgió de la escucha activa de mis pacientes: mujeres que atravesaban cambios hormonales, síntomas persistentes, alteraciones en su bienestar íntimo y sexual, o etapas de transición en las que muchas veces no encontraban respuestas satisfactorias dentro de la medicina tradicional.</p>
                        <p>Esa necesidad creciente me impulsó a realizar una formación profunda y continua en terapias regenerativas, medicina funcional y tecnologías avanzadas aplicadas a la ginecología, incorporando herramientas innovadoras que me permiten ofrecer tratamientos personalizados, seguros y enfocados en mejorar la calidad de vida.</p>
                        <p>Hoy, mi propósito es acompañar a cada mujer con una mirada médica cercana, científica y humana, ayudándola a recuperar equilibrio, bienestar, vitalidad y confianza en cada etapa de su vida.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SobreMi;
