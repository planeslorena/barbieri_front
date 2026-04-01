"use client";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import "./banner.css";
import { useRouter } from 'next/navigation';

export default function Banner() {
  const router = useRouter();

  return (
    <section id="inicio" className="section-bg hero-section-gineco position-relative overflow-hidden">

      <Container className="position-relative z-1">
        <Row className="align-items-center g-5 py-4">

          {/* TEXTO */}
          <Col lg={6} className="text-lg-start">

            <div className="badge-gineco d-inline-flex align-items-center gap-2 mb-4">
              <span className="badge-gineco-text">
                Ginecología Funcional e Integrativa
              </span>
            </div>

            <div className='hero-title'>
              <h1 className="hero-title-gineco mb-4 text-left">
                Salud Femenina
                <br />con Enfoque
                <br /><span className="color-primary">Integrativo</span>
              </h1>
            </div>

            <p className="hero-description-gineco lead mb-4">
              Bienvenidos a un espacio diseñado para tu bienestar integral, porque los cambios en el cuerpo, las molestias o las dudas que aparecen en distintas etapas de la vida merecen ser escuchadas y atendidas.  <br />La ginecología funcional y regenerativa abre nuevas posibilidades para acompañar estos procesos y mejorar la calidad de vida desde un enfoque respetuoso y personalizado.
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">

              <button className="btn-gineco-primary">
                <a className="text-decoration-none text-white p-2" href="https://miomedicina.sc3-server3.com.ar/miturno" target="_blank" rel="noopener noreferrer">Agendar Consulta</a>
                <i className="bi bi-calendar3"></i>
              </button>

              <button onClick={() => { router.push('/tratamientos') }} className="btn-gineco-secondary">
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
              <p className="text-muted small mb-0">Escuchar, comprender y acompañar a cada mujer desde una mirada integral.</p>
            </div>

          </Col>

        </Row>
      </Container>
    </section>
  );
}