
'use client';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/layout/auth-provider";
import { Stethoscope } from "lucide-react";
import Link from "next/link";
import 'animate.css';
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { href: "/planes", label: "Planes" },
    { href: "/directorio", label: "Directorio" },
    { href: "/estudios", label: "Estudios" }
]

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-body">
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-background/80 backdrop-blur-md">
        <Link href="/landing" className="flex items-center gap-2 font-bold text-lg">
          <Stethoscope className="h-7 w-7 text-primary" />
          <span className="font-headline text-primary">UroVital</span>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map(link => (
                <Button key={link.href} asChild variant="ghost" className={cn(
                    pathname.startsWith(link.href) && "text-primary"
                )}>
                    <Link href={link.href}>{link.label}</Link>
                </Button>
            ))}
        </nav>
        <div className="flex items-center gap-4">
            <Button asChild>
                <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                  {isAuthenticated ? "Ir al Panel" : "Iniciar Sesión"}
                </Link>
            </Button>
        </div>
      </header>

      <div aria-hidden className="h-20 md:h-24 w-full" />
      <div className="flex-1">{children}</div>

      <footer className="py-12 bg-card/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} UroVital. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
