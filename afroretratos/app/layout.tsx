import type { Metadata, Viewport } from "next";
import { Archivo_Black, Bodoni_Moda, Ubuntu } from "next/font/google";
import "./globals.css";

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-body-loaded",
  display: "swap",
});

const displayFallback = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display-fallback",
  display: "swap",
});

const subtitleFallback = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-subtitle-fallback",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#510000",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AfroRetratos",
    template: "%s · AfroRetratos",
  },
  description:
    "Plataforma cultural AfroRetratos: representatividade, autoestima e pertencimento: ações, eventos e um Feed de relatos anônimos.",
  applicationName: "AfroRetratos",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "AfroRetratos",
    images: [
      {
        url: "/brand/og-default.png",
        width: 1200,
        height: 630,
        alt: "Logotipo AfroRetratos em bege sobre vinho",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${ubuntu.variable} ${displayFallback.variable} ${subtitleFallback.variable}`}
    >
      <body className="min-h-screen antialiased">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-beige focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-wine"
        >
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  );
}
