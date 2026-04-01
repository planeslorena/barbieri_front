'use client';

import './page.css';
import { useRouter } from 'next/navigation';
import WhatsappButton from '@/app/components/home/whatsappButton/WhatsappButton';
import { Menu } from '@/app/components/Navbar/navbar';
import Banner from '@/app/components/home/banner/Banner';
import { Footer } from '@/app/components/footer/Footer';
import Tratamientos from '@/app/components/home/tratamientos/tratamientos';
import EsParaMi from '@/app/components/home/esParaMi/esParaMi';
import SobreMi from '@/app/components/home/sobreMi/sobreMi';
import Testimonios from '@/app/components/home/testimonios/testimonio';
import Contacto from '@/app/components/home/contacto/contacto';

export default function HomePage() {
  const router = useRouter();

  const handleReserve = () => {
    // El turnero de clientes está en la ruta /client
    router.push('/client');
  };

  return (
    <main className="home-page">
      <Menu />
      <Banner />
      <Tratamientos />
      <EsParaMi />
      <SobreMi />
      <Testimonios />
      <Contacto />
      <Footer />
      <WhatsappButton />
    </main>
  );
}

