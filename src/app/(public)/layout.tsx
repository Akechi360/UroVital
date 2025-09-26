// src/app/(public)/layout.tsx
import { Button } from "@/components/ui/button";
import { Stethoscope } from "lucide-react";
import Link from "next/link";
import 'animate.css';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground font-body">
      <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-background/80 backdrop-blur-md">
        <Link href="/landing" className="flex items-center gap-2 font-bold text-lg">
          <Stethoscope className="h-7 w-7 text-primary-landing" />
          <span className="font-headline text-primary-landing">UroVital</span>
        </Link>
        <div className="flex items-center gap-4">
            <Button asChild variant="ghost">
                <Link href="/planes">Planes</Link>
            </Button>
            <Button asChild variant="ghost">
                <Link href="/directorio">Directorio</Link>
            </Button>
            <Button asChild variant="ghost">
                <Link href="/estudios">Estudios</Link>
            </Button>
            <Button asChild>
                <Link href="/login">Iniciar Sesión</Link>
            </Button>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} UroVital. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
