
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Stethoscope, Check, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const benefits = [
    "Cobertura anual integral para emergencias, APS, estudios y hospitalización.",
    "Procedimientos quirúrgicos electivos o de emergencia según las condiciones del plan.",
    "Traslados en ambulancia a nivel regional y nacional.",
    "Atención y soporte continuo 24/7."
];

const coverage = [
    { item: "Servicios quirúrgicos (electiva/emergencia)", affiliates200: "14.000", affiliates500: "35.000" },
    { item: "Atención Primaria en Salud (APS)", affiliates200: "11.150", affiliates500: "27.125" },
    { item: "Laboratorio, enfermería y consulta domiciliaria", affiliates200: "5.250", affiliates500: "13.125" },
    { item: "Traslados de ambulancia (regional/nacional)", affiliates200: "2.000", affiliates500: "5.250" },
    { item: "Insumos, material médico, alquiler de equipos", affiliates200: "2.600", affiliates500: "7.000" },
];

export default function FondoEspirituSantoPage() {
  return (
    <main className="container mx-auto px-4 pt-28 pb-20">
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
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
                    <CardTitle className="text-3xl font-bold font-headline text-primary-landing">Fondo Autogestionado Espíritu Santo</CardTitle>
                    <CardDescription className="text-lg">Una solución de salud integral diseñada para colectivos, empresas y organizaciones.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-xl">Beneficios Clave</h3>
                            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                            {benefits.map(benefit => (
                                <li key={benefit} className="flex items-start">
                                    <Check className="w-5 h-5 mr-3 mt-0.5 text-green-500 shrink-0" />
                                    <span className="text-muted-foreground">{benefit}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                        <div className="space-y-4">
                        <h3 className="font-semibold text-xl">Costos y Cobertura del Fondo</h3>
                        <p className="text-muted-foreground">La cobertura y distribución de los fondos se ajusta al tamaño del grupo, garantizando una atención adecuada a las necesidades del colectivo.</p>
                        <div className="grid sm:grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Cobertura Anual del Fondo</p>
                                <p className="font-bold text-lg text-primary-landing">35.000$ a 87.500$</p>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <p className="text-sm text-muted-foreground">Cuota Anual Administrativa</p>
                                <p className="font-bold text-lg text-primary-landing">250$</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-xl">Distribución de Cobertura (Ejemplos)</h3>
                            <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rubro</TableHead>
                                    <TableHead className="text-right">200 Afiliados</TableHead>
                                    <TableHead className="text-right">500 Afiliados</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coverage.map(cat => (
                                    <TableRow key={cat.item}>
                                        <TableCell className="font-medium">{cat.item}</TableCell>
                                        <TableCell className="text-right font-semibold">${cat.affiliates200}</TableCell>
                                        <TableCell className="text-right font-semibold">${cat.affiliates500}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                            <p className="text-xs text-muted-foreground italic pt-2">Coberturas sujetas al tamaño del grupo. Aplican condiciones según clínicas convenidas.</p>
                    </div>
                </CardContent>
                <CardFooter className="bg-muted/30 p-8 flex justify-end">
                    <Button size="lg" className="w-full sm:w-auto bg-primary-landing hover:bg-primary-landing/90">
                        Contactar para Afiliación Grupal
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    </main>
  );
}
