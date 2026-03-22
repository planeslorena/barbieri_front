import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { UserContextProvider } from "./context/user.context";
import { Cormorant_Garamond, Montserrat } from "next/font/google";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cormorant",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Dra. Florencia Barbieri",
  description: "Ginecología funcional e integrativa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${montserrat.variable}`}>
      <UserContextProvider>
        <body>{children}</body>
      </UserContextProvider>
    </html>
  );
}
