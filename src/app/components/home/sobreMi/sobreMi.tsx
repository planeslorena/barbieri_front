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
                        <p>Con más de 12 años de experiencia, mi misión ha sido transformar la consulta ginecológica tradicional en una experiencia de escucha activa y bienestar real.</p>
                        <p>Me especializo en el uso de tecnologías láser de vanguardia y en el estudio hormonal profundo, permitiendo que cada mujer recupere su confianza y vitalidad en cada etapa, desde la juventud hasta la menopausia.</p>
                    </div>
                    <div className="row justify-content-center gap-2 pt-3">
                        <div className="col-5">
                            <div className="fs-2 fw-bold text-primary">12+</div>
                            <div className="datos text-uppercase">Años exp.</div>
                        </div>
                        <div className="col-5">
                            <div className="fs-2 fw-bold text-primary">5k+</div>
                            <div className="datos text-uppercase">Pacientes</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SobreMi;
