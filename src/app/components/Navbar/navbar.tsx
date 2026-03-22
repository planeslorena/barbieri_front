'use client'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import './navbar.css';
import { useRouter } from 'next/navigation';

export function Menu() {
    const router = useRouter();

    return (
        <Navbar expand="lg" className="nav-bar px-5">
            <Container fluid className="d-flex align-items-center">
                <Navbar.Brand >
                    <img
                        src="/images/logo.png"
                        className="img-fluid img-logo"
                        alt="Logo Florencia Barbieri"
                        onClick={() => { router.push('/home') }}
                    />

                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mx-auto">
                        <Nav.Link className="mx-2" onClick={() => { router.push('/home') }} >Inicio</Nav.Link>
                        <Nav.Link className="mx-2" onClick={() => { router.push('/home#servicios') }}>Tratamientos</Nav.Link>
                        <Nav.Link className="mx-2" onClick={() => { router.push('/home#sucursal') }}>Sobre mí</Nav.Link>
                        <Nav.Link className="mx-2" onClick={() => { router.push('/home#faqs') }}>Testimonios</Nav.Link>
                        <Nav.Link className="mx-2" onClick={() => { router.push('/home#faqs') }}>Contacto</Nav.Link>
                    </Nav>
                    <button
                        className="btn-style btn-iniciar-sesion ms-auto mx-2"
                    >
                        <a className="text-decoration-none text-white" href="https://www.stt.com.ar/turnosNENEKIDS" target="_blank" rel="noopener noreferrer"> Agendar consulta</a>
                    </button>
                </Navbar.Collapse>
            </Container>
        </Navbar >
    );
}