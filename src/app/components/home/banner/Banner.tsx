"use client";
import { useState } from "react";
import "./banner.css";

export default function Banner() {
  const [showModal, setShowModal] = useState(false);

  return (
    <section id="inicio" className="hero-section hero-pattern position-relative overflow-hidden">
      <div className="container position-relative z-1">
        <div className="row align-items-center g-5 py-1 py-lg-1">

          {/* TEXTO */}
          <div className="col-lg-6 text-center text-lg-start">

            <div className="badge-hero floating-badge d-inline-flex align-items-center gap-2 shadow-sm mb-4">              
              <i className="bi bi-star-fill color-tertiary"></i>
              <span className="badge-text">
                Peluquería Nené Kids
              </span>
            </div>

            <h1 className="hero-title mb-4">
              Donde <span className="color-secondary">brillar</span> es <br /> un
              <span className="color-primary"> juego</span>.
            </h1>

            <p className="hero-description lead mb-5 mx-auto mx-lg-0">
              Transformamos el corte de pelo en una aventura llena de color,
              juegos y mucha onda. ¡Nené Kids es el lugar favorito de los más peques!
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">

              <button onClick={() => {}} className="btn btn-hero-primary">
                <a className="text-decoration-none text-white"  href="https://www.stt.com.ar/turnosNENEKIDS" target="_blank" rel="noopener noreferrer">¡RESERVA AHORA!</a>
              </button>

              <button
                className="btn btn-hero-secondary d-flex align-items-center justify-content-center gap-2"
                onClick={() => setShowModal(true)}
              >
                <i className="bi bi-play-circle-fill"></i>
                Ver Experiencia
              </button>

            </div>
          </div>

          {/* IMAGEN */}
          <div className="col-lg-6 position-relative">
            <div className="hero-blob-bg blob-shape-2"></div>

            <div className="hero-image-wrapper shadow-lg">
              <img
                src="./images/peluqueria4.jpeg"
                alt="Foto de la peluquería infantil Nené Kids "
                className="img-fluid hero-image"
              />

              <div className="hero-icon blob-shape">
                <i className="bi bi-scissors"></i>
              </div>
            </div>

            <div className="hero-bg-blur"></div>

          </div>

        </div>
      </div>

      {showModal && (
        <div className="video-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={() => setShowModal(false)}>
              ×
            </button>

            <video
              src="/videos/video_experiencia.mp4"
              controls
              autoPlay
              className="video-modal-player"
            />
          </div>
        </div>
      )}
    </section>
  );
}