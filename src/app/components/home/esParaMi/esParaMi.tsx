import './esParaMi.css';

const benefits = [
    'Desajustes hormonales o periodos irregulares.',
    'Molestias en la zona íntima o suelo pélvico debilitado.',
    'Deseo de un enfoque preventivo y funcional de la salud.',
    'Búsqueda de alternativas tecnológicas no invasivas.',
];


export default function EsParaMi() {
    return (
        <section className="parami section-bg rounded-4 mb-5 p-4 p-lg-5  position-relative overflow-hidden" id="esParaMi">
            <div className="organic-shape"></div>

            <div className=" px-3 px-lg-5 pt-5">
                <div className="row gx-5 gy-5 align-items-start">

                    <div className="col-lg-6">
                        <h2 className="title color-primary mb-4 position-relative">¿Es para mí?</h2>
                        <p className=" mb-4 ">
                            Ideal para acompañarte en situaciones como:
                        </p>
                        <ul className="list-unstyled mb-4">
                            {benefits.map((item) => (
                                <li key={item} className="d-flex align-items-center gap-3 mb-3">
                                    <i className="bi bi-check-circle-fill color-primary icon-list"></i>
                                    <span className="text-lg">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-4 border-top border-primary/20">
                            <p className="font-display fs-4 text-center fst-italic text-primary">
                                "Siempre bajo evaluación médica personalizada."
                            </p>
                        </div>
                    </div>

                    <div className="col-lg-6 py-3">
                        <div className="row g-3">
                            <div className="col-6 esParaMi-item esParaMi-item-1">
                                <div className="ratio ratio-1x1 rounded-3 overflow-hidden shadow-lg">
                                    <img src="/images/collage1.png" alt="" className="esParaMi-image w-100 h-100" />
                                </div>
                            </div>
                            <div className="col-6 esParaMi-item esParaMi-item-2">
                                <div className="ratio ratio-3x4 rounded-3 overflow-hidden shadow-lg">
                                    <img src="/images/collage2.png" alt="" className="esParaMi-image w-100 h-100" />
                                </div>
                            </div>
                            <div className="col-6 esParaMi-item esParaMi-item-3">
                                <div className="ratio ratio-3x4 rounded-3 overflow-hidden shadow-lg">
                                    <img src="/images/collage3.png" alt="" className="esParaMi-image w-100 h-100" />
                                </div>
                            </div>
                            <div className="col-6 mt-3 esParaMi-item esParaMi-item-4">
                                <div className="ratio ratio-1x1 rounded-3 overflow-hidden shadow-lg">
                                    <img src="/images/collage4.png" alt="" className="esParaMi-image w-100 h-100" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
