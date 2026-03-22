/* ===== BANNER HERO SECTION ===== */
.banner-hero {
  position: relative;
  margin-bottom: 4rem;
}

.z-10 {
  position: relative;
  z-index: 10;
}

/* Title */
.banner-title {
  font-family: var(--font-title);
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 500;
  line-height: 1.3;
  color: var(--font-color);
}

/* Description */
.banner-description {
  color: #6c757d;
  font-size: 1.0625rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

/* Primary Button */
.btn-banner-primary {
  background-color: var(--color-primary);
  color: white;
  padding: 1rem 2rem;
  border-radius: 9999px;
  font-weight: 600;
  border: none;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(161, 141, 65, 0.2);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-banner-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(161, 141, 65, 0.3);
  background-color: #8b7732;
  color: white;
}

.btn-banner-primary i {
  font-size: 0.875rem;
}

/* Secondary Button */
.btn-banner-secondary {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
  padding: 0.5rem 0;
  transition: all 0.3s ease;
  display: block;
}

.btn-banner-secondary:hover {
  color: #8b7732;
}

/* Image Container */
.banner-image-container {
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.banner-image {
  width: 100%;
  height: 320px;
  object-fit: cover;
  display: block;
}

/* Organic Shape Decoration */
.organic-shape-decoration {
  position: absolute;
  top: -40px;
  left: -30px;
  width: 192px;
  height: 192px;
  background-color: rgba(161, 141, 65, 0.1);
  border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
  z-index: -10;
  animation: pulse-shape 3s ease-in-out infinite;
}

@keyframes pulse-shape {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
}

/* Glass Card */
.glass-card-banner {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  padding: 1rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  font-size: 1.5rem;
}

.glass-card-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-primary);
  margin: 0;
  margin-bottom: 0.25rem;
}

.glass-card-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--font-color);
  margin: 0;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .banner-description {
    color: #a8a8a8;
  }

  .btn-banner-secondary {
    color: var(--color-primary);
  }

  .btn-banner-secondary:hover {
    color: #c4b366;
  }

  .glass-card-banner {
    background: rgba(45, 45, 45, 0.3);
    border-color: rgba(161, 141, 65, 0.2);
  }

  .glass-card-text {
    color: #f2e0d5;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .banner-title {
    font-size: clamp(1.875rem, 4vw, 2.5rem);
  }

  .banner-description {
    font-size: 1rem;
  }

  .banner-image {
    height: 280px;
  }

  .organic-shape-decoration {
    width: 128px;
    height: 128px;
    top: -20px;
    left: -10px;
  }

  .glass-card-banner {
    bottom: 0.75rem;
    left: 0.75rem;
    right: 0.75rem;
    padding: 0.75rem;
  }

  .icon-circle {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .glass-card-label {
    font-size: 0.7rem;
  }

  .glass-card-text {
    font-size: 0.8125rem;
  }
}

"use client";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import "./banner.css";

export default function Banner() {
  return (
    <section id="inicio" className="banner-hero mb-5">
      <Container>
        <Row className="align-items-center g-5 py-5">
          {/* CONTENIDO TEXTO */}
          <Col lg={6} className="position-relative z-10">
            <h1 className="banner-title mb-4">
              Salud Femenina con Enfoque <span className="color-primary italic">Integrativo</span>
            </h1>

            <p className="banner-description mb-4">
              Especialista en ginecología funcional, tratamientos láser de vanguardia y bienestar integral para cada etapa de tu vida.
            </p>

            <div className="d-flex flex-column gap-3">
              <a href="#" className="btn-banner-primary d-flex align-items-center justify-content-center gap-2">
                Agendar Consulta
                <i className="bi bi-calendar-month"></i>
              </a>
              <a href="#procedimientos" className="btn-banner-secondary text-center">
                Ver Tratamientos
              </a>
            </div>
          </Col>

          {/* IMAGEN */}
          <Col lg={6} className="position-relative">
            <div className="organic-shape-decoration"></div>
            
            <div className="banner-image-container">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXFghRTclsoESI3DdaPeHrKrN05FkY-YFARicIBglyQAggWnnOpgFDkM7j0I-Ne9TgFINLCb2wcf3wX-rvVqYrqG2IWIWddK2GtH6itUwkhUNky0FRduHHT-W0u42wjYWtSFUk74Yn66qI-ZzYZ2oeL85RG5b_xCOyuVuyizuK8mmXvARC2KoxRXKQTmUNSHsP8uWsXjP8djUJ6cFp9AeklCpZMWYpxU3dM3rmFbdA4bbVMDEokk4KFlebDC6Z48N15Up6120dFgCc"
                alt="Doctora Florencia Barbieri con tecnología láser DEKA"
                className="banner-image"
              />
            </div>

            <div className="glass-card-banner">
              <div className="icon-circle">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div>
                <p className="glass-card-label">Tecnología de Punta</p>
                <p className="glass-card-text">Tratamiento Dr. Arnold &amp; Deka</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}