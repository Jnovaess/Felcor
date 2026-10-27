import type { Metadata } from "next";
import "./globals.css";
import "./felcor.css";
import "./checkout.css";

export const metadata: Metadata = {
  title: "Felcor Grooming | Modele o visual. Marque presença.",
  description: "Pastas modeladoras para cabelo Felcor Grooming. Modele o visual. Marque presença.",
  icons: {
    icon: "/assets/felcor-logo.jpg",
    shortcut: "/assets/felcor-logo.jpg",
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
