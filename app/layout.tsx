import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marquiori Barber Club | Seu estilo. Sua assinatura.",
  description: "Cabelo, barba e cuidados pessoais na Marquiori Barber Club.",
  icons: {
    icon: "/assets/logo.png",
    shortcut: "/assets/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
