"use client";

import "./contacto.css";

export default function Contacto() {
  return (
    <section className="py-4 px-3" id="contacto">
      <div className="container">
        <div className="row g-5 align-items-center">
          
          {/* 📝 Info */}
          <div className="col-lg-6 d-flex">
            <div className="contacto-content">
              <h2 className="title mb-4">Contacto y Ubicación</h2>


              {/* MAPA (móvil) */}
              <div className="mapa-container-mobile mb-4 d-block d-lg-none">
                <iframe className="rounded-4" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3191.073321551784!2d-60.33479332453038!3d-36.88859417222208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9594459924de8101%3A0xdd207c15b5b0a3a5!2sDra.%20Barbieri%20Maria%20Florencia!5e0!3m2!1ses!2sar!4v1774637329153!5m2!1ses!2sar" loading="lazy"></iframe>
              </div>

              {/* ITEMS */}
              <div className="mb-4">
                <ContactItem
                  icon="location_on"
                  title="Dirección"
                  text="San Lorenzo 2590, Olavarria"
                />

                <ContactItem
                  icon="call"
                  title="Teléfono"
                  text="2284-722425"
                />

              </div>

              {/* HORARIO */}
              <div className="horario-box">
                <h4 className="mb-3">Horario de Atención</h4>

                <div className="horario-item">
                  <span>Lunes a Miercoles</span>
                  <span>09:00 - 17:00</span>
                </div>

                <div className="horario-item">
                  <span>Jueves</span>
                  <span>09:00 - 16:00</span>
                </div>
                <div className="horario-item">
                  <span>Viernes</span>
                  <span>09:00 - 12:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🗺️ Mapa */}
          <div className="col-lg-6 d-none d-lg-flex">
            <div className="mapa-container p-3 shadow-lg w-100">
              <iframe className="rounded-4" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3191.073321551784!2d-60.33479332453038!3d-36.88859417222208!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9594459924de8101%3A0xdd207c15b5b0a3a5!2sDra.%20Barbieri%20Maria%20Florencia!5e0!3m2!1ses!2sar!4v1774637329153!5m2!1ses!2sar" loading="lazy" width="450" height="600"></iframe>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function ContactItem({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  return (
    <div className="contact-item">
      <div className="contact-icon">
        <span className="material-symbols-outlined">{icon}</span>
      </div>

      <div>
        <div className="fw-bold">{title}</div>
        <div className="contact-text">{text}</div>
      </div>
    </div>
  );
}