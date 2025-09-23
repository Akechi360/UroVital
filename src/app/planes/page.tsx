
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Check } from 'lucide-react';
import { motion } from 'framer-motion';

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
        description: "Ideal para individuos y familias pequeñas que buscan una cobertura esencial y accesible.",
        price: "Individual + 2 Beneficiarios",
        features: [
            "Consultas médicas gratuitas (hasta 6 al año).",
            "Descuentos en estudios de laboratorio e imagenología.",
            "Acceso a consultas de fisiatría y rehabilitación.",
            "Descuentos en procedimientos quirúrgicos.",
            "Kit de afiliación con carnet digital."
        ]
    },
    {
        name: "Fondo Espíritu Santo",
        description: "Cobertura completa y flexible para grupos y empresas, garantizando la tranquilidad de tus colaboradores.",
        price: "Grupos de 200-500 afiliados",
        features: [
            "Cobertura anual desde 35.000 hasta 87.500 USD.",
            "Atención en emergencias y accidentes.",
            "Consultas médicas y Atención Primaria en Salud (APS).",
            "Estudios especializados e imagenología.",
            "Procedimientos quirúrgicos y hospitalización.",
            "Traslados en ambulancia y atención 24/7."
        ]
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {plans.map((plan, index) => (
                    <motion.div
                        key={plan.name}
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn(0.2 * (index + 1))}
                    >
                         <Card className="flex flex-col h-full rounded-2xl shadow-lg transition-all duration-300 ease-in-out bg-card/50 hover:scale-[1.02] hover:shadow-primary-landing/20 hover:shadow-2xl">
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold font-headline text-primary-landing">{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-4">
                                <p className="font-semibold text-lg">{plan.price}</p>
                                <ul className="space-y-3">
                                    {plan.features.map(feature => (
                                        <li key={feature} className="flex items-start">
                                            <Check className="w-5 h-5 mr-3 mt-0.5 text-green-500 shrink-0" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
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

