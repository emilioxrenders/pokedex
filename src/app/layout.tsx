import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pokédex",
  description: "Pokédex application using Next.js with the /app structure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="font-light container mx-auto px-8 py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
