// src/app/finanzas/pagos/page.tsx
export default function PagosDirectos() {
  return (
    <div className="p-6 border rounded-lg bg-card">
      <h2 className="text-xl font-semibold">[OBSOLETO] Pagos Directos</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Esta vista ya no está activa. Usa el módulo independiente:
        <span className="ml-1 font-medium">Finanzas</span>
        (ruta <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-sm">/finanzas</code>).
      </p>
    </div>
  );
}
