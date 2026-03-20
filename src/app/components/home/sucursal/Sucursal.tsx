import "./Sucursal.css";

export default function Sucursal() {

  const direccion = "Celestino Muñoz 2184 Olavarria, Buenos Aires";

  const abrirMapa = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccion)}`;
    window.open(url, "_blank");
  };

  return (
    <section id="sucursal" className="py-5 overflow-hidden">
      <div className="container">

        <div className="sucursal-card shadow-lg">
          <div className="row g-0">

            {/* INFORMACIÓN */}
            <div className="col-lg-6 sucursal-info">

              <h2 className="sucursal-title">
                ¡Vení a visitarnos!
              </h2>

              <div className="d-flex flex-column gap-4">

                {/* Dirección */}
                <div className="sucursal-item">

                  <div className="icon-box icon-primary">
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>

                  <div>
                    <h4 className="sucursal-subtitle">
                      Dirección
                    </h4>

                    <p className="text-muted mb-0">
                      Celestino Muñoz 2184<br/>
                      Olavarria, Buenos Aires
                    </p>
                  </div>

                </div>

                {/* Horarios */}
                <div className="sucursal-item">

                  <div className="icon-box icon-secondary">
                    <i className="bi bi-clock-fill"></i>
                  </div>

                  <div>
                    <h4 className="sucursal-subtitle">
                      Horarios
                    </h4>

                    <p className="text-muted mb-0">
                      Mar a Sáb: 10:00 - 12:30 hs y de 15:00 a 20:00 hs<br/>
                      Domingos: Cerrado
                    </p>
                  </div>

                </div>

                {/* Teléfono */}
                <div className="sucursal-item">

                  <div className="icon-box icon-tertiary">
                    <i className="bi bi-telephone-fill"></i>
                  </div>

                  <div>
                    <h4 className="sucursal-subtitle">
                      Llamanos
                    </h4>

                    <p className="text-muted mb-0">
                      2284 594159
                    </p>
                  </div>

                </div>

              </div>

              <button
                onClick={abrirMapa}
                className="btn sucursal-btn mt-4"
              >
                Cómo llegar
               <i className="bi bi-sign-turn-right-fill"></i>
              </button>

            </div>


            {/* MAPA */}
            <div className="col-lg-6">

              <div className="map-container">

              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3190.2533511490396!2d-60.31751172452936!3d-36.90820647221649!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959445cedf654bbf%3A0x9fe88cede936073b!2sPeluqueria%20infantil%20NEN%C3%8A%20KIDS!5e0!3m2!1ses!2sar!4v1772752680196!5m2!1ses!2sar" width="600" height="450"  loading="lazy"></iframe>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
}