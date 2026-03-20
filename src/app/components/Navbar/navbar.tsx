'use client'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import './navbar.css';
import { useRouter } from 'next/navigation';

export function Menu() {
    const router = useRouter();

    return (
        <>
            <Navbar expand="lg" className="bg-light nav-bar px-5">
                <Container fluid className="d-flex align-items-center">
                    <Navbar.Brand >
                        <img
                            src="/images/logo2.jpg"
                            className="img-fluid img-logo rounded-circle"
                            alt="Logo Nene Kids"
                            onClick={() => { router.push('/home') }}
                        />

                    </Navbar.Brand>
                    <Nav className="nav-redes">
                        <Nav.Link
                            href="https://wa.me/5492284594159"
                            target="_blank"
                            rel="noopener noreferrer"
                            className='redes'
                        >
                            <i className="bi bi-whatsapp color-primary" />
                        </Nav.Link>
                        <Nav.Link
                            href="https://www.instagram.com/pelu.nenekids"
                            target="_blank"
                            rel="noopener noreferrer"
                            className='redes'
                        >
                            <i className="bi bi-instagram color-secondary"></i>
                        </Nav.Link>
                        <Nav.Link
                            href="https://maps.app.goo.gl/3FEqYAQxf9ehemuo7"
                            target="_blank"
                            rel="noopener noreferrer"
                            className='redes'
                        >
                            <i className="bi bi-geo-alt color-tertiary"></i>
                        </Nav.Link>
                    </Nav>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link className="mx-2" onClick={() => { router.push('/home') }} >Inicio</Nav.Link>
                            <Nav.Link className="mx-2" onClick={() => { router.push('/home#servicios') }}>Servicios</Nav.Link>
                            <Nav.Link className="mx-2" onClick={() => { router.push('/home#sucursal') }}>Nosotros</Nav.Link>
                            <Nav.Link className="mx-2" onClick={() => { router.push('/home#faqs') }}>Preguntas Frecuentes</Nav.Link>
                        </Nav>
                        <i className="bi bi-heart-fill color-primary mx-2"></i>
                        <button
                            className="btn-style btn-iniciar-sesion mx-2"
                            //onClick={() => { router.push('/client') }}
                        >
                            <a className="text-decoration-none text-white"  href="https://www.stt.com.ar/turnosNENEKIDS" target="_blank" rel="noopener noreferrer"> Reservar Turno</a>                          
                        </button>
                    </Navbar.Collapse>

                </Container>
            </Navbar >
            <div className="rainbow-bg"></div>

        </>
    );
}