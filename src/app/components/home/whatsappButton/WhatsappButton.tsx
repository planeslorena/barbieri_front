import './WhatsappButton.css';

export default function WhatsappButton() {
  return (
    <div className="nk-whatsapp-container">
    <a
      href="https://wa.me/5492284722425"
      target="_blank"
      rel="noopener noreferrer"
      className="nk-whatsapp-button"
      aria-label="Escribir por WhatsApp"
    >
      <i className="bi bi-whatsapp whatsapp-button"></i>
    </a>
    </div>
  );
}

