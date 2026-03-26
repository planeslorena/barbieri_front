import './tratamientos.css';

const treatments = [
  {
    title: 'Ginecología Funcional',
    icon: 'utero',
    description:
      'Buscamos el equilibrio hormonal y el bienestar desde la raíz, tratando no solo los síntomas sino las causas.',
  },
  {
    title: 'Tecnología Láser',
    icon: 'laser',
    description:
      'Tratamientos mínimamente invasivos para regeneración, tensado vaginal y salud íntima sin cirugía.',
  },
  {
    title: 'Salud Pélvica',
    icon: 'meditacion',
    description:
      'Fortalecimiento y recuperación del suelo pélvico para mejorar tu calidad de vida diaria.',
  },
];

export default function Tratamientos() {
  return (
    <section id="tratamientos" className="py-5 dark:bg-background-dark/50">
      <div className="container px-3 px-lg-5">
        <div className="text-center mx-auto mb-5" style={{ maxWidth: '50rem' }}>
          <h2 className="text-primary fw-bold text-uppercase small tracking-widest mb-2">Especialidades</h2>
          <h3 className="title mb-3">Nuestros Tratamientos</h3>
          <p className="text-secondary mb-0">Ofrecemos soluciones avanzadas utilizando la última tecnología y un enfoque funcional para tu salud.</p>
        </div>

        <div className="row g-4">
          {treatments.map((treatment) => (
            <div key={treatment.title} className="col-md-4">
              <article className="tratamiento-card h-100 p-4 rounded-4 border overflow-hidden">
                <div className="icon-circle mb-3 d-inline-flex align-items-center justify-content-center">
                  <img src={`/images/${treatment.icon}.png`}
                    alt="Foto de la Dra. Florencia Barbieri" className="material-symbols-outlined fs-2"/>
                </div>
                <h4 className="fs-5 fw-bold mb-3">{treatment.title}</h4>
                <p className="mb-4 tratamiento-text">{treatment.description}</p>
                <a href="#" className="tratamiento-link fw-bold d-inline-flex align-items-center gap-1">
                  Saber más
                  <i className="bi bi-arrow-right"></i>
                </a>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
