// src/app/(app)/afiliaciones/page.tsx
'use client';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import affiliations from '@/lib/data/affiliations.json';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AffiliationStatCards } from "@/components/affiliations/stat-cards";


export default function AfiliacionesPage() {
  return (
    <div className="flex flex-col gap-8">
        <PageHeader 
            title="🤝 Afiliaciones"
            actions={
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Afiliación
                </Button>
            }
        />
        <AffiliationStatCards affiliations={affiliations} />
        <Card>
            <CardContent className="p-0">
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Promotora</TableHead>
                            <TableHead>Afiliados Totales</TableHead>
                            <TableHead>Última Afiliación</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {affiliations.map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/50 cursor-pointer">
                                <TableCell className="font-mono text-xs">{item.id}</TableCell>
                                <TableCell className="font-medium">{item.promotora}</TableCell>
                                <TableCell>{item.afiliados}</TableCell>
                                <TableCell>{new Date(item.ultimaAfiliacion).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Badge className={cn(
                                        item.estado === "Activo" 
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700/60"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-700/40 dark:text-gray-300 border-gray-200 dark:border-gray-600/60"
                                    )}>
                                        {item.estado}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Ver detalle</DropdownMenuItem>
                                            <DropdownMenuItem>Editar</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-500">Eliminar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <div className="p-6 border rounded-lg bg-card/50 text-center mt-8">
            <h2 className="text-xl font-semibold">Página de Lista Placeholder</h2>
            <p className="mt-2 text-sm text-muted-foreground">
                Esta es la página <code className="bg-muted px-1 rounded-sm">/afiliaciones/lista</code> que se usará para la gestión detallada.
            </p>
             <Button asChild variant="link">
                <Link href="/afiliaciones/lista">Ir a la lista</Link>
            </Button>
        </div>
    </div>
  );
}
