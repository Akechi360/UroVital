
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const fadeIn = (delay: number) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay,
      ease: 'easeOut',
    },
  },
});

const plans = [
    {
        name: "Tarjeta Saludable",
        subtitle: "Individual + 2 Beneficiarios",
        features: [
            "Consultas médicas gratuitas (hasta 6 al año).",
            "Descuentos en laboratorio e imagenología.",
            "Acceso a fisiatría y rehabilitación.",
            "Descuentos en procedimientos quirúrgicos.",
            "Kit de afiliación con carnet digital."
        ],
        pricing: [
            { label: "Contado", value: "150 / año" },
            { label: "Fraccionado", value: "50 inicial + 10 mensuales" },
            { label: "Afiliación", value: "0" },
        ],
        note: "Montos referenciales en divisas. Sujeto a alianzas y disponibilidad."
    },
    {
        name: "Fondo Espíritu Santo",
        subtitle: "Grupos de 200–500 afiliados",
        features: [
            "Cobertura anual integral (emergencias, APS, estudios, hospitalización).",
            "Procedimientos quirúrgicos electivos o de emergencia.",
            "Traslados en ambulancia (regional/nacional) y atención 24/7."
        ],
        coverage: {
            fund: "35.000 (200 afiliados) — 87.500 (500 afiliados)",
            adminFee: "250",
            breakdown: [
                { service: "Servicios quirúrgicos (electiva/emergencia)", "200": "14.000", "500": "35.000" },
                { service: "Atención Primaria en Salud (APS)", "200": "11.150", "500": "27.125" },
                { service: "Laboratorio, enfermería y consulta domiciliaria", "200": "5.250", "500": "13.125" },
                { service: "Traslados de ambulancia (regional/nacional)", "200": "2.000", "500": "5.250" },
                { service: "Insumos, material médico, alquiler de equipos", "200": "2.600", "500": "7.000" },
            ]
        },
        note: "Coberturas sujetas al tamaño del grupo (200–500). Aplican clínicas convenidas."
    }
]

export default function PlansPage() {
  return (
    <div className="w-full bg-background text-foreground font-body">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-background/80 backdrop-blur-md">
            <Link href="/landing" className="flex items-center gap-2 font-bold text-lg">
                <Stethoscope className="h-7 w-7 text-primary-landing" />
                <span className="font-headline text-primary-landing">UroVital</span>
            </Link>
            <Button asChild variant="ghost">
                <Link href="/login">Iniciar Sesión</Link>
            </Button>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 pt-28 pb-20">
             <motion.div 
                initial="hidden"
                animate="visible"
                variants={fadeIn(0)}
                className="text-center mb-16"
            >
                <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl font-headline">
                    Nuestros Planes de Salud
                </h1>
                <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">
                    Elige el plan que mejor se adapte a ti, tu familia o tu empresa.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.name}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn(0.2 * (index + 1))}
                    >
                         <Card className={cn(
                            "flex flex-col h-full rounded-2xl shadow-lg transition-all duration-300 ease-in-out bg-card/50 hover:scale-[1.02]",
                            "hover:shadow-[0_0_20px_rgba(46,49,146,0.4)]"
                            )}>
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold font-headline text-primary-landing">{plan.name}</CardTitle>
                                <CardDescription>{plan.subtitle}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-6">
                                <ul className="space-y-3">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-start">
                                            <Check className="w-5 h-5 mr-3 mt-0.5 text-green-500 shrink-0" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {plan.pricing && (
                                    <div className="space-y-2 pt-4 border-t">
                                         <h4 className="font-semibold">Precios (US$)</h4>
                                         {plan.pricing.map(item => (
                                            <div key={item.label} className="flex justify-between text-sm">
                                                <span className="text-muted-foreground">{item.label}:</span>
                                                <span className="font-medium">{item.value}</span>
                                            </div>
                                         ))}
                                    </div>
                                )}

                                {plan.coverage && (
                                    <div className="space-y-4 pt-4 border-t">
                                        <h4 className="font-semibold">Coberturas y Costos Clave (US$)</h4>
                                        <div className="text-sm space-y-1">
                                            <div className="flex justify-between"><span className="text-muted-foreground">Cobertura anual del fondo:</span> <span className="font-medium text-right">{plan.coverage.fund}</span></div>
                                            <div className="flex justify-between"><span className="text-muted-foreground">Cuota anual administrativa:</span> <span className="font-medium">{plan.coverage.adminFee}</span></div>
                                        </div>
                                        <Table className="text-xs">
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Rubro</TableHead>
                                                    <TableHead className="text-right">200 afiliados</TableHead>
                                                    <TableHead className="text-right">500 afiliados</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {plan.coverage.breakdown.map(item => (
                                                    <TableRow key={item.service}>
                                                        <TableCell className="font-medium">{item.service}</TableCell>
                                                        <TableCell className="text-right">{item['200']}</TableCell>
                                                        <TableCell className="text-right">{item['500']}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                                
                            </CardContent>
                            <CardFooter className="flex flex-col items-start gap-4 !pt-0">
                                <p className="text-xs text-muted-foreground italic w-full pt-4 border-t">{plan.note}</p>
                                <Button size="lg" className="w-full bg-primary-landing hover:bg-primary-landing/90">
                                    Afíliate Ahora
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </main>

        {/* Footer */}
        <footer className="py-12 bg-gray-50 dark:bg-gray-900/50">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} UroVital. Todos los derechos reservados.</p>
            </div>
        </footer>
    </div>
  );
}
