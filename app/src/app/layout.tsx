import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.scss";
import { Providers } from "@/contexts/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carro em Dados",
  description: "Site oficial Carro em Dados",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
