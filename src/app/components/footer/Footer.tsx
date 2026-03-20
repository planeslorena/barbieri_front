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
                  src="/images/logo2.jpg"
                  className="img-fluid img-logo rounded-circle"
                  alt="Logo Nené Kids"
                />
                <span className="footerTitle">Nené Kids</span>
              </div>

              <p className="footerDescription">
                Creando sonrisas y estilos únicos para los más pequeños desde 2020.
                Somos la peluquería infantil número uno de la ciudad.
              </p>

              <div className="footerSocial">

                <a className="socialCircle" href="https://wa.me/541112345678" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-whatsapp color-primary" />
                </a>

                <a className="socialCircle secondary" href="https://www.instagram.com/pelu.nenekids" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-instagram color-secondary"></i>
                </a>

                <a className="socialCircle tertiary" href="https://maps.app.goo.gl/3FEqYAQxf9ehemuo7" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-geo-alt color-tertiary"></i>
                </a>

              </div>

            </div>
          </Col>

          {/* Links */}
          <Col md={6}>
            <h5 className="footerHeading">Links Rápidos</h5>

            <ul className="footerLinks">
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="#servicios">Servicios</a></li>
              <li><a href="https://www.stt.com.ar/turnosNENEKIDS" target="_blank" rel="noopener noreferrer">Turnos Online</a></li>
              <li><a href="#sucursal">Nuestra Sucursal</a></li>
              <li><a href="#faqs">Preguntas Frecuentes</a></li>
              <li><a href="https://wa.me/541112345678" target="_blank" rel="noopener noreferrer">Trabajá con nosotros</a></li>
            </ul>
          </Col>

        </Row>

        {/* Bottom */}
        <div className="footerBottom">

          <p>
            © 2026 Nené Kids Peluquería Infantil. Todos los derechos reservados.
          </p>

          <div className="footerLegal">
            Creado por 
            <a href="https://tuwebstudio.com.ar" className="link-underline-light" target="_blank" rel="noopener noreferrer"> TuWeb Studio</a>
          </div>

        </div>
      </Container>

      {/* blobs decorativos */}
      <div className="footerBlob1"></div>
      <div className="footerBlob2"></div>

    </footer>
  );
}

