'use client';

import { useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import './tratamientos.css';

const treatments = [
  {
    title: 'Ginecología Funcional y Regenerativa',
    icon: 'utero',
    saber_mas: 'ginecologia',
    description:
      'En cada consulta, buscamos juntas el porqué detrás de los síntomas, identificamos causas reales y diseñamos un abordaje que acompañe cada etapa de tu vida.',
  },
  {
    title: 'Incontinencia de Orina',
    icon: 'laser',
    saber_mas: 'incontinencia',
    description:
      'Tratamientos no invasivos para regeneración, tensado vaginal y salud íntima, sin cirugía. Evaluamos tu caso y elegimos juntas la mejor opción: láser vaginal o Dr. Arnold.',
  },
  {
    title: 'Salud Intima en la Menopausia',
    icon: 'meditacion',
    saber_mas: 'sequedad',
    description:
      'Tratamientos personalizados que mejoran la hidratación, elasticidad y bienestar íntimo. Desde terapias locales y ácido hialurónico hasta tecnología láser avanzada.',
  },
  {
    title: 'Tecnología regenerativa',
    icon: 'laser',
    saber_mas: 'rejuvenecimiento',
    featured: true,
    description:
      'Opciones no invasivas para recuperar bienestar íntimo, mejorar la calidad de vida y acompañar cada etapa con tratamientos seguros y personalizados.',
  },
];

const treatmentImages = [
  {
    title: 'Láser Vaginal Fotona',
    use: 'Indicado para casos de sequedad vaginal e incontinencia de orina.',
    image: '/images/tratamientos/LaserFotona.jpeg',
  },
  {
    title: 'Láser Vaginal Fotona',
    use: 'Procedimiento no invasivo que trabaja directamente sobre el tejido, estimulando la producción de colágeno y mejorando su calidad.',
    image: '/images/tratamientos/LaserFotona2.jpeg',
  },
  {
    title: 'Silla Magnética Dr. Arnold',
    use: 'Estimula el piso pélvico, indicado para casos de incontinencia de orina, recuperación post parto y disfunciones sexuales.',
    image: '/images/tratamientos/SillonDrArnold.jpeg',
  },
  {
    title: 'Hidratación con Ácido Hialurónico',
    use: 'Mejora el volumen y la hidratación de la piel íntima.',
    image: '/images/tratamientos/AcidoHialuronico.jpg',
  },
  {
    title: 'Hidratación con Ácido Hialurónico',
    use: 'Indicado para sequedad vaginal, irritación, ardor y molestias en la zona íntima.',
    image: '/images/tratamientos/acidoHialuronico2.png',
  },
];

const featuredTreatment = treatments.find((treatment) => treatment.featured) || treatments[1];
const treatmentCards = treatments.filter((treatment) => !treatment.featured);

export default function Tratamientos() {
  const [carouselReady, setCarouselReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setCarouselReady(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section id="tratamientos" className="py-5 dark:bg-background-dark/50">
      <div className="container px-3 px-lg-5">
        <div className="text-center mx-auto mb-5" style={{ maxWidth: '50rem' }}>
          <h2 className="text-primary fw-bold text-uppercase small tracking-widest mb-2">Especialidades</h2>
          <h3 className="title mb-3">Tratamientos</h3>
          <p className="text-secondary mb-0">Soluciones avanzadas utilizando la última tecnología y un enfoque funcional para tu salud.</p>
        </div>

        <div className="tratamientos-showcase mb-5">
          {carouselReady ? (
            <Carousel className="tratamientos-carousel" interval={4500} pause="hover">
              {treatmentImages.map((item) => (
                <Carousel.Item key={item.image}>
                  <div className="tratamientos-carousel-frame">
                    <img src={item.image} alt={item.title} />
                    <div className="tratamientos-carousel-caption">
                      <strong>{item.title}</strong>
                      <span>{item.use}</span>
                    </div>
                  </div>
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <div className="tratamientos-carousel tratamientos-carousel-placeholder" aria-hidden="true" />
          )}

          <article className="tratamiento-card tratamientos-feature-card h-100 p-4 rounded-4 border overflow-hidden">
            <div className="icon-circle mb-3 d-inline-flex align-items-center justify-content-center">
              <img src={`/images/${featuredTreatment.icon}.png`} alt="" className="material-symbols-outlined fs-2" />
            </div>
            <span className="tratamientos-feature-eyebrow">Tratamiento destacado</span>
            <h4 className="fs-5 fw-bold mb-3">{featuredTreatment.title}</h4>
            <p className="mb-4 tratamiento-text">{featuredTreatment.description}</p>
            <a href={`/tratamientos#${featuredTreatment.saber_mas}`} className="tratamiento-link fw-bold d-inline-flex align-items-center gap-1">
              Saber más
              <i className="bi bi-arrow-right"></i>
            </a>
          </article>
        </div>

        <div className="row g-4">
          {treatmentCards.map((treatment) => (
            <div key={treatment.title} className="col-md-4">
              <article className="tratamiento-card h-100 p-4 rounded-4 border overflow-hidden">
                <div className="icon-circle mb-3 d-inline-flex align-items-center justify-content-center">
                  <img src={`/images/${treatment.icon}.png`} alt="" className="material-symbols-outlined fs-2" />
                </div>
                <h4 className="fs-5 fw-bold mb-3">{treatment.title}</h4>
                <p className="mb-4 tratamiento-text">{treatment.description}</p>
                <a href={`/tratamientos#${treatment.saber_mas}`} className="tratamiento-link fw-bold d-inline-flex align-items-center gap-1">
                  Saber más
                  <i className="bi bi-arrow-right"></i>
                </a>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
