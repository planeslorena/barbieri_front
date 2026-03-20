import type { Metadata } from "next";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { UserContextProvider } from "./context/user.context";
import { Fredoka, Quicksand } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-quicksand",
  display: "swap",
});


export const metadata: Metadata = {
  title: "Nene Kids",
  description: "Peluquería infantil",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${fredoka.variable} ${quicksand.variable}`}>
      <UserContextProvider>
        <body>{children}</body>
      </UserContextProvider>
    </html>
  );
}
