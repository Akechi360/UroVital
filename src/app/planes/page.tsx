
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
        ],
        priceSummary: "150$ anual o 50 inicial + 10 mensuales",
        detailsUrl: "/planes/tarjeta-saludable",
    },
    {
        name: "Fondo Espíritu Santo",
        subtitle: "Grupos de 200–500 afiliados",
        features: [
            "Cobertura anual integral (emergencias, APS, estudios, hospitalización).",
            "Procedimientos quirúrgicos electivos o de emergencia.",
            "Traslados en ambulancia y atención 24/7.",
        ],
        priceSummary: "Cobertura anual entre 35.000 y 87.500 USD",
        detailsUrl: "/planes/fondo-espiritu-santo",
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.name}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn(0.2 * (index + 1))}
                    >
                         <Card className={cn(
                            "flex flex-col h-full rounded-2xl shadow-sm transition-all duration-300 ease-in-out bg-card/50",
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
                                
                                <div className="pt-4 border-t">
                                  <h4 className="font-semibold">Precio</h4>
                                  <p className="text-muted-foreground">{plan.priceSummary}</p>
                                </div>
                                
                            </CardContent>
                            <CardFooter className="flex-col items-stretch gap-2 !pt-4">
                                <Button size="lg" className="w-full bg-primary-landing hover:bg-primary-landing/90">
                                    Afíliate Ahora
                                </Button>
                                <Button asChild size="lg" variant="outline" className="w-full transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(46,49,146,0.3)]">
                                    <Link href={plan.detailsUrl}>Ver detalles</Link>
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
