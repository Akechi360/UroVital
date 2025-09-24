// src/app/finanzas/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Finanzas — UroVital",
};

export default function FinanzasPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">💳 Finanzas</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Módulo Finanzas (independiente) — en construcción.  
        Aquí estarán Pagos Directos, Notas de entrega y Comprobantes.
      </p>

      <div className="mt-6">
        <Button asChild>
            <Link
            href="/finanzas/pagos"
            >
            Ir a Pagos Directos
            </Link>
        </Button>
      </div>

      <div className="mt-8 text-xs text-muted-foreground">
        Nota: Este módulo es un placeholder seguro. No se eliminó ni modificó
        ningún submódulo existente. Realiza pruebas en /finanzas/pagos antes de
        proceder a migrar o eliminar otros módulos.
      </div>
    </div>
  );
}
