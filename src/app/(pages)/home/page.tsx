'use client';

import './page.css';
import { useRouter } from 'next/navigation';
import Servicios from '@/app/components/home/servicios/Servicios';
import BranchSection from '@/app/components/home/sucursal/Sucursal';
import WhatsappButton from '@/app/components/home/whatsappButton/WhatsappButton';
import { Menu } from '@/app/components/Navbar/navbar';
import Banner from '@/app/components/home/banner/Banner';
import Faqs from '@/app/components/home/faqs/faqs';
import { Footer } from '@/app/components/footer/Footer';

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
      <Servicios />
      <BranchSection />
      <Faqs />
      <Footer />
      <WhatsappButton />
    </main>
  );
}

