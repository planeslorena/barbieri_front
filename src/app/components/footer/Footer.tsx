'use client'

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Image from "next/image";
import "./footer.css";

export function Footer() {
  return (
    <footer className="footerSection">

      <Container className="footerContent">
        <Row className="footerGrid">

          {/* Logo + descripción */}
          <Col md={6}>
            <div className="footerBrand">

              <div className="footerLogo">
                <img
                  src="/images/logo.png"
                  className="img-fluid img-logo"
                  alt="Logo Dra. Florencia Barbieri"
                />
              </div>

              <p className="footerDescription">
                Especialistas en ginecología funcional y regenerativa. Cuidando de ti con la tecnología más avanzada y un trato humano.
              </p>

              <div className="footerSocial">

                <a className="socialCircle" href="https://wa.me/5492284722425" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-whatsapp color-primary" />
                </a>

                <a className="socialCircle secondary" href="https://www.instagram.com/drabarbieriflorencia" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-instagram color-primary"></i>
                </a>
              </div>

            </div>
          </Col>

          {/* Links */}
          <Col md={6}>
            <h5 className="footerHeading">Navegación</h5>

            <ul className="footerLinks">
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#tratamientos">Tratamientos</a></li>
              <li><a href="https://miomedicina.sc3-server3.com.ar/miturno" target="_blank" rel="noopener noreferrer">Turnos Online</a></li>
              <li><a href="#sobre-mi">Sobre Mí</a></li>
              <li><a href="#testimonios">Testimonios</a></li>
              <li><a href="#contacto">Contacto</a></li>
            </ul>
          </Col>

        </Row>

        {/* Bottom */}
        <div className="footerBottom">

          <p>
            © 2026 Dra. Florencia Barbieri. Todos los derechos reservados.
          </p>

          <div className="footerLegal">
            Creado por
            <a href="https://tuwebstudio.com.ar" className="link-underline-dark color-primary" target="_blank" rel="noopener noreferrer"> TuWeb Studio</a>
          </div>

        </div>
      </Container>

    </footer>
  );
}

