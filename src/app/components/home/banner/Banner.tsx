"use client";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import "./banner.css";

export default function Banner() {
  return (
    <section id="inicio" className="section-bg hero-section-gineco position-relative overflow-hidden">

      <Container className="position-relative z-1">
        <Row className="align-items-center g-5 py-4">

          {/* TEXTO */}
          <Col lg={6} className="text-lg-start">

            <div className="badge-gineco d-inline-flex align-items-center gap-2 mb-4">
              <span className="badge-gineco-text">
                Ginecología Funcional y Estética
              </span>
            </div>

            <div className='hero-title'>
              <h1 className="hero-title-gineco mb-4 text-left">
                Salud Femenina
                <br />con Enfoque
                <br /><span className="color-primary">Integrativo</span>
              </h1>
            </div>

            <p className="hero-description-gineco lead mb-5">
              Bienvenidos a un espacio diseñado para tu bienestar integral. Un enfoque moderno y humano para acompañarte en cada etapa de tu vida.
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">

              <button className="btn-gineco-primary">
                <a className="text-decoration-none text-white p-2" href="" target="_blank" rel="noopener noreferrer">Agendar Consulta</a>
                <i className="bi bi-calendar3"></i>
              </button>

              <button className="btn-gineco-secondary">
                Ver Tratamientos
              </button>

            </div>
          </Col>

          {/* IMAGEN */}
          <Col lg={6} className="position-relative d-flex justify-content-center">
            <div className="organic-shape-decoration"></div>
            <div className="hero-image-gineco-wrapper shadow-lg">
              <img
                src="/images/foto_perfil.jpg"
                alt="Foto de la Dra. Florencia Barbieri"
                className="img-fluid hero-image-gineco"
              />
            </div>

            <div className="info-card-gineco shadow">
              <div className="d-flex align-items-center gap-3 mb-2">
                <i className="bi bi-check-circle-fill color-primary icon-circle"></i>
                <span className="fw-bold">Atención Personalizada</span>
              </div>
              <p className="text-muted small mb-0">Escuchamos tus necesidades para brindarte la mejor solución clínica.</p>
            </div>

          </Col>

        </Row>
      </Container>
    </section>
  );
}