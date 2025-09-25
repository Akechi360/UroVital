// src/app/(app)/afiliaciones/page.tsx
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Users } from "lucide-react";

export default function AfiliacionesPage() {
  return (
    <div className="flex flex-col gap-8">
        <PageHeader title="🤝 Afiliaciones" />
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-primary" />
                    <span>Módulo de Afiliaciones</span>
                </CardTitle>
                <CardDescription>
                    Módulo en construcción — aquí gestionaremos promotoras y sus afiliaciones.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Este espacio está reservado para las futuras funcionalidades de gestión de afiliaciones, seguimiento de promotoras y reportería asociada.
                </p>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4 border-t pt-6">
                 <Button asChild>
                    <Link href="/afiliaciones/lista">
                        Ir a Afiliaciones
                    </Link>
                </Button>
                <p className="text-xs text-muted-foreground italic">
                   Nota: Este módulo es un placeholder seguro. No elimina ni modifica ningún otro submódulo existente.
                </p>
            </CardFooter>
        </Card>
    </div>
  );
}
