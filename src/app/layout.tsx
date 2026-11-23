import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { getCurrentSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Sistema Nancy | Préstamos y Créditos de Zapatillas",
  description:
    "Panel de administración y control financiero para préstamos en efectivo y créditos de calzado deportivo",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Sistema Nancy",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0f172a",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  // Si no hay sesión (pantalla de Login)
  if (!session) {
    return (
      <html lang="es" className="h-full antialiased">
        <body className="h-full bg-slate-950 text-slate-100 font-sans">
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="es" className="h-full antialiased">
      <body className="h-full bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row overflow-hidden">
        {/* Barra de Navegación y Menú Móvil */}
        <MobileNav user={session} />

        {/* Barra Lateral Fija (Desktop) */}
        <Sidebar user={session} />

        {/* Área de Contenido Principal */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Header user={session} />
          <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 pb-24 md:pb-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
