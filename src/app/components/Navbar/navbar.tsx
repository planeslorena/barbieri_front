'use client'
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import './navbar.css';
import { usePathname, useRouter } from 'next/navigation';
import { NavDropdown } from 'react-bootstrap';
import { LogoutButton } from '@/app/components/auth/LogoutButton';

export function Menu() {
    const router = useRouter();
    const pathname = usePathname();
    const showLogoutButton = pathname?.startsWith('/admin')
        || pathname?.startsWith('/profesional')
        || pathname?.startsWith('/client');

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
                        <NavDropdown className="mx-2" title="Tratamientos" id="basic-nav-dropdown">
                            <NavDropdown.Item href="/tratamientos#ginecologia">Ginecologia Funcional</NavDropdown.Item>
                            <NavDropdown.Item href="/tratamientos#incontinencia">
                                Incontinencia de Orina
                            </NavDropdown.Item>
                            <NavDropdown.Item href="/tratamientos#sequedad">Sequedad Vaginal</NavDropdown.Item>
                            <NavDropdown.Item href="/tratamientos#rejuvenecimiento">
                                Rejuvenecimiento Vaginal
                            </NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link className="mx-2" onClick={() => { router.push('/home#sobre-mi') }}>Sobre mí</Nav.Link>
                        <Nav.Link className="mx-2" onClick={() => { router.push('/home#testimonios') }}>Testimonios</Nav.Link>
                        <Nav.Link className="mx-2" onClick={() => { router.push('/home#contacto') }}>Contacto</Nav.Link>
                    </Nav>
                    {showLogoutButton ? (
                        <LogoutButton className="ms-auto mx-2" />
                    ) : (
                        <button
                            className="btn-style btn-iniciar-sesion ms-auto mx-2"
                        >
                            <a className="text-decoration-none text-white" href="https://miomedicina.sc3-server3.com.ar/miturno" target="_blank" rel="noopener noreferrer"> Agendar consulta</a>
                        </button>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar >
    );
}
