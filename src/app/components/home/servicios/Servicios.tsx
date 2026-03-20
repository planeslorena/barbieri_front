import './Servicios.css';

export default function Servicios() {
  return (
    <section id="servicios" className="servicios py-5">
      <div className="container">

        {/* titulo */}
        <div className="text-center mb-5">
          <h2 className="services-title mb-3">
            Nuestros Servicios
          </h2>

          <p>
            Mucho más que un corte de pelo, en Nené Kids ofrecemos una experiencia completa para los peques. 
          </p>
        </div>

        <div className="row g-4">

          {/* servicio 1 */}
          <div className="col-md-3">
            <div className="service-card-image ">

              <img
                src="/images/primercorte.jpg"
                alt="corte de pelo para bebés"
                className="service-bg "
              />

              <div className="service-overlay"></div>

              <div className="service-content text-center">

                <h3 className="service-title color-primary">
                  Primer Corte
                </h3>

                <p className="service-text">
                  Realizado con paciencia, cuidado y las herramientas adecuadas. Incluye diploma, primer mechón de recuerdo y una experiencia súper dulce para el bebé.
                </p>

              </div>

            </div>
          </div>

          {/* servicio 2 */}
          <div className="col-md-3">
            <div className="service-card-image">

              <img
                src="/images/corte.jpg"
                alt="corte de pelo para niños y niñas"
                className="service-bg"
              />

              <div className="service-overlay"></div>

              <div className="service-content text-center">

                <h3 className="service-title color-secondary">
                  Cortes para niños y niñas
                </h3>

                <p className="service-text">
                  Trabajamos con amor y paciencia para que cada corte sea una experiencia divertida y sin estrés para los peques. Al final, ¡siempre hay una sorpresa para llevar a casa!
                </p>
              </div>

            </div>
          </div>

          {/* servicio 3 */}
          <div className="col-md-3">
            <div className="service-card-image">

              <img
                src="/images/peinados.jpg"
                alt="peinados"
                className="service-bg"
              />

              <div className="service-overlay"></div>

              <div className="service-content text-center">

                <h3 className="service-title color-tertiary">
                  Peinados
                </h3>

                <p className="service-text">
                  Peinados para toda la familia. Trenzas mágicas, peinados para eventos o simplemente para darle un toque especial al día a día.
                </p>

              </div>

            </div>
          </div>

          {/* servicio 4 */}
          <div className="col-md-3">
            <div className="service-card-image">

              <img
                src="/images/disfraces.jpg"
                alt="disfraces"
                className="service-bg"
              />

              <div className="service-overlay"></div>

              <div className="service-content text-center">

                <h3 className="service-title color-fourth">
                  Disfraces y accesorios
                </h3>

                <p className="service-text">
                   Disfraces de princesas, superhéroes y todos los personalejes favoritos de los niños y niñas. Tambien todos los accesorios para el pelo.
                </p>

              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

