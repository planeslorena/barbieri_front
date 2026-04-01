"use client";

import "./testimonios.css";
import { Carousel } from "react-bootstrap";

export default function Testimonios() {
    const testimonios = [
        {
            text: `"No tengo más calores, duermo espectacular de corrido, tengo más energia, y no me siento cansada. Esos son mis cambios mas evidentes."`,
            author: "",
        },
        {
            text: `"Sos una profesional impecable que me ha sabido guiar y acompañar a cada paso, desde la etapa de la premenopausia y ahora en la menopausia."`,
            author: "",
        },
        {
            text: `"Luego de dialogar con Flor hicimos todos los estudios debidos para poder abordar desde una mirada integral. Y a ello le sumamos el pellet hormonal que para mi fue un giro total. ¡los cambios fueron increibles!"`,
            author: "",
        },
    ];

    return (
        <section className="py-5" id="testimonios">
            <div className="container">
                <div className="text-center mb-5">
                    <h2 className="text-primary fw-bold tracking-widest text-uppercase fs-6">Experiencias</h2>
                    <h2 className="title">Testimonios</h2>
                </div>

                {/* 🖥️ Desktop */}
                <div className="row g-4 d-none d-md-flex">
                    {testimonios.map((item, index) => (
                        <div className="col-md-4" key={index}>
                            <TestimonioCard item={item} />
                        </div>
                    ))}
                </div>

                {/* 📱 Mobile */}
                <div className="d-md-none">
                    <Carousel indicators={false}>
                        {testimonios.map((item, index) => (
                            <Carousel.Item key={index}>
                                <TestimonioCard item={item} />
                            </Carousel.Item>
                        ))}
                    </Carousel>
                </div>
            </div>
        </section>
    );
}

function TestimonioCard({ item }: any) {
    return (
        <div className="testimonio-card">
            <span className="quote-icon material-symbols-outlined">
                format_quote
            </span>

            <div className="stars color-primary mb-3">
                {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-symbols-outlined">
                        star
                    </span>
                ))}
            </div>

            <p className="testimonio-text">{item.text}</p>

        </div>
    );
}