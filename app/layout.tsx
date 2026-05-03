import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ORNIX | Crafted. Divine. Timeless.",
  description: "Premium cinematic collectibles and custom illuminated creations."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <div className="noise-layer" />
      </body>
    </html>
  );
}
