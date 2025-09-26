
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Stethoscope, Check, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const benefits = [
    "Consultas médicas gratuitas (hasta 6 al año).",
    "Descuentos especiales en estudios de laboratorio e imagenología.",
    "Acceso a consultas de fisiatría y rehabilitación.",
    "Descuentos significativos en procedimientos quirúrgicos.",
    "Kit de afiliación que incluye un carnet digital personalizado."
];

const costs = [
    { item: "Pago de Contado", price: "150$ / año" },
    { item: "Pago Fraccionado (Inicial)", price: "50$" },
    { item: "Pago Fraccionado (Cuotas)", price: "10$ / mensuales" },
    { item: "Costo de Afiliación", price: "0$" },
];

export default function TarjetaSaludablePage() {
  return (
    <main className="container mx-auto px-4 pt-28 pb-20">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
        >
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/planes">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Planes
                </Link>
            </Button>

            <Card className={cn(
                "rounded-2xl shadow-sm bg-card/50 overflow-hidden",
                "shadow-[0_0_20px_rgba(46,49,146,0.2)] dark:shadow-[0_0_30px_rgba(46,49,146,0.3)]"
            )}>
                <CardHeader className="bg-muted/30 p-8">
                    <CardTitle className="text-3xl font-bold font-headline text-primary-landing">Plan Tarjeta Saludable</CardTitle>
                    <CardDescription className="text-lg">Ideal para individuos y familias pequeñas que buscan acceso preferencial a servicios de salud.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="font-semibold text-xl">Beneficios Incluidos</h3>
                            <ul className="space-y-3">
                            {benefits.map(benefit => (
                                <li key={benefit} className="flex items-start">
                                    <Check className="w-5 h-5 mr-3 mt-0.5 text-green-500 shrink-0" />
                                    <span className="text-muted-foreground">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                        <div className="space-y-6">
                        <h3 className="font-semibold text-xl">Estructura de Costos</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Concepto</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {costs.map(cost => (
                                    <TableRow key={cost.item}>
                                        <TableCell className="font-medium">{cost.item}</TableCell>
                                        <TableCell className="text-right font-semibold">{cost.price}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <p className="text-xs text-muted-foreground italic pt-4">Montos referenciales en divisas. Sujeto a alianzas y disponibilidad.</p>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-8 flex justify-end">
                    <Button size="lg" className="w-full sm:w-auto bg-primary-landing hover:bg-primary-landing/90">
                        Afíliate Ahora
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    </main>
  );
}
