
'use client';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/layout/auth-provider";
import { Stethoscope, Mail, Phone, MapPin, Clock } from "lucide-react";
import Link from "next/link";
import 'animate.css';
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from 'react';
import Footer from "@/components/layout/footer";

const NAV_LINKS = [
    { href: "/landing", label: "Inicio" },
    { href: "/directorio", label: "Directorio" },
    { href: "/estudios", label: "Estudios" },
    { href: "#contact", label: "Contacto" },
]

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  const showLandingHeader = pathname === '/landing';

  useEffect(() => {
    if (!showLandingHeader) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showLandingHeader]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-body">
      {showLandingHeader && (
        <header className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "bg-background/95 shadow-md backdrop-blur-sm" : "bg-transparent"
        )}>
          {/* Top Bar */}
          <div className="bg-[#EBF1F8] dark:bg-gray-900/50 text-xs text-gray-600 dark:text-gray-300">
              <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                          <Phone size={14} />
                          <span>+012 345 6789</span>
                      </div>
                      <div className="hidden md:flex items-center gap-2">
                          <Mail size={14} />
                          <span>info@urovital.com</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                       <div className="hidden lg:flex items-center gap-2">
                          <Clock size={14} />
                          <span>Horario: Lun - Vie: 9am - 5pm</span>
                      </div>
                       <div className="hidden md:flex items-center gap-2">
                          <MapPin size={14} />
                          <span>Valencia, Edo. Carabobo</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Main Header */}
          <div className="container mx-auto px-4">
              <div className="flex justify-between items-center py-4">
                  <Link href="/landing" className="flex items-center gap-2 font-bold text-lg">
                      <div className={cn("p-2 rounded-md transition-colors", scrolled ? "bg-primary/10" : "bg-white")}>
                          <Stethoscope className="h-7 w-7 text-primary" />
                      </div>
                      <span className="font-headline text-primary">UroVital</span>
                  </Link>
                  <nav className="hidden lg:flex items-center gap-2">
                      {NAV_LINKS.map(link => (
                          <Button key={link.href} asChild variant="ghost" className={cn(
                              "font-semibold",
                              (pathname === link.href || (link.href !== '/landing' && pathname.startsWith(link.href))) && "text-primary"
                          )}>
                              <Link href={link.href}>{link.label}</Link>
                          </Button>
                      ))}
                  </nav>
                  <div className="flex items-center gap-2">
                      <Button asChild>
                          <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                            {isAuthenticated ? "Ir al Panel" : "Afíliate Ahora"}
                          </Link>
                      </Button>
                       <Button asChild variant="outline">
                          <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                            Iniciar Sesión
                          </Link>
                      </Button>
                  </div>
              </div>
          </div>
        </header>
      )}


      <main className={cn("flex-1", !showLandingHeader && 'pt-16')}>
        {children}
      </main>

      <Footer />
    </div>
  );
}
