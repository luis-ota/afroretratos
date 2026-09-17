import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/**
 * Chrome do site publico: header com navegacao e rodape. A area /admin tem
 * estrutura propria e nao herda nada daqui.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main id="conteudo">{children}</main>
      <Footer />
    </>
  );
}
