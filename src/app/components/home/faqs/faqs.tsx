'use client'

import Accordion from 'react-bootstrap/Accordion'
import './Faqs.css'

export default function Faq() {
  return (
    <section id="faqs" className="py-5 faq-section">
      <div className="container faq-container">

        <h2 className="faq-title text-center mb-5">
          Preguntas Frecuentes
        </h2>

        <Accordion  className="faq-accordion">

          <Accordion.Item eventKey="0" className="faq-item">
            <Accordion.Header className="faq-header">
              ¿A partir de qué edad pueden cortarse?
            </Accordion.Header>

            <Accordion.Body className="faq-text">
              ¡Desde que tienen pelito! Tenemos sillas especiales para bebés y
              mucha paciencia para el primer corte.
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1" className="faq-item">
            <Accordion.Header className="faq-header">
              ¿Es necesario sacar turno previo?
            </Accordion.Header>

            <Accordion.Body className="faq-text">
              Recomendamos reservar tu turno online para evitar esperas y
              asegurar que el sillón favorito esté libre.
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="2" className="faq-item">
            <Accordion.Header className="faq-header">
              ¿Tienen juegos mientras esperan?
            </Accordion.Header>

            <Accordion.Body className="faq-text">
              ¡Por supuesto! Contamos con una zona de juegos, tablets con
              dibujos animados y una estación de dibujo.
            </Accordion.Body>
          </Accordion.Item>

        </Accordion>

      </div>
    </section>
  )
}