
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Stethoscope, Check, Users, ShieldCheck, HeartPulse, Bone, FlaskConical, ZoomIn } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const specialtyItems = [
    { name: "Urología", icon: ShieldCheck },
    { name: "Ginecología", icon: Users },
    { name: "Oncología", icon: HeartPulse },
    { name: "Medicina Interna", icon: Bone },
];


export default function LandingPage() {
  return (
    <div className="w-full bg-background text-foreground font-body">
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="relative flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-50 dark:bg-gray-900/50"
      >
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[410px] w-[410px] rounded-full bg-primary-landing/20 opacity-20 blur-[120px]"></div>

        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
            <Link href="/landing" className="flex items-center gap-2 font-bold text-lg">
                <Stethoscope className="h-7 w-7 text-primary-landing" />
                <span className="font-headline text-primary-landing">UroVital</span>
            </Link>
            <Button asChild variant="ghost">
                <Link href="/login">Iniciar Sesión</Link>
            </Button>
        </header>

        <motion.h1 
            variants={fadeIn}
            className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl font-headline"
        >
            Más que un servicio de salud, <br className="hidden md:block"/>
            <span className="text-primary-landing">un aliado para tu vida</span>
        </motion.h1>
        <motion.p 
            variants={fadeIn}
            className="max-w-2xl mx-auto mt-6 text-lg text-muted-foreground"
        >
            Programación intuitiva, portal seguro y beneficios médicos integrales.
        </motion.p>
        <motion.div variants={fadeIn} className="mt-8">
            <Button size="lg" className="bg-primary-landing hover:bg-primary-landing/90">
                <Link href="/planes">Afíliate Ahora</Link>
            </Button>
        </motion.div>
      </motion.section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer}>
            <motion.h2 variants={fadeIn} className="text-3xl font-bold md:text-4xl font-headline">Más salud por menos dinero</motion.h2>
            <motion.p variants={fadeIn} className="max-w-3xl mx-auto mt-4 text-muted-foreground">
                UroVital se adapta a tus necesidades, con cobertura integral, consultas gratuitas y descuentos en estudios y cirugías.
            </motion.p>

            <motion.div 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, amount: 0.3 }} 
                variants={staggerContainer} 
                className="grid max-w-4xl grid-cols-1 gap-8 mx-auto mt-12 text-left md:grid-cols-2"
            >
                <motion.div variants={fadeIn} className="flex items-start p-6 space-x-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <Check className="w-6 h-6 mt-1 text-green-500 shrink-0" />
                    <div>
                        <h3 className="font-semibold">Consultas gratuitas</h3>
                        <p className="text-sm text-muted-foreground">Accede a consultas ilimitadas con nuestros especialistas sin costo adicional.</p>
                    </div>
                </motion.div>
                <motion.div variants={fadeIn} className="flex items-start p-6 space-x-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <Check className="w-6 h-6 mt-1 text-green-500 shrink-0" />
                    <div>
                        <h3 className="font-semibold">Descuentos en estudios</h3>
                        <p className="text-sm text-muted-foreground">Obtén precios preferenciales en laboratorio e imagenología.</p>
                    </div>
                </motion.div>
                <motion.div variants={fadeIn} className="flex items-start p-6 space-x-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <Check className="w-6 h-6 mt-1 text-green-500 shrink-0" />
                    <div>
                        <h3 className="font-semibold">Cobertura quirúrgica</h3>
                        <p className="text-sm text-muted-foreground">Alianzas estratégicas para ofrecerte la mejor cobertura en procedimientos.</p>
                    </div>
                </motion.div>
                <motion.div variants={fadeIn} className="flex items-start p-6 space-x-4 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                    <Check className="w-6 h-6 mt-1 text-green-500 shrink-0" />
                    <div>
                        <h3 className="font-semibold">Atención y emergencias 24/7</h3>
                        <p className="text-sm text-muted-foreground">Soporte continuo para que te sientas seguro en todo momento.</p>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div variants={fadeIn} className="mt-12">
                <Button variant="outline" asChild>
                    <Link href="/planes">Ver Planes</Link>
                </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer}>
                <motion.h2 variants={fadeIn} className="text-3xl font-bold md:text-4xl font-headline">Nuestras Especialidades</motion.h2>
                <motion.p variants={fadeIn} className="max-w-2xl mx-auto mt-4 text-muted-foreground">Un equipo multidisciplinario dedicado a tu bienestar integral.</motion.p>
                
                <motion.div variants={staggerContainer} className="grid grid-cols-2 gap-4 mt-12 md:grid-cols-4 lg:gap-8">
                    {specialtyItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div key={index} variants={fadeIn}>
                                <Card className="py-8 transition-transform duration-300 transform md:py-12 hover:scale-105 hover:bg-accent/50">
                                    <CardContent className="flex flex-col items-center justify-center gap-4">
                                        <div className="p-3 rounded-full bg-primary-landing/10">
                                            <Icon className="w-8 h-8 text-primary-landing" />
                                        </div>
                                        <h3 className="font-semibold text-center">{item.name}</h3>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <motion.div variants={fadeIn} className="mt-12">
                    <Button asChild>
                        <Link href="/directorio">Ver Directorio Médico</Link>
                    </Button>
                </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Studies Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer}>
                <motion.h2 variants={fadeIn} className="text-3xl font-bold md:text-4xl font-headline">Estudios Urológicos</motion.h2>
                <motion.p variants={fadeIn} className="max-w-2xl mx-auto mt-4 text-muted-foreground">
                    Más de 50 estudios y procedimientos especializados en urología y uroginecología.
                </motion.p>
                <motion.div variants={fadeIn} className="max-w-2xl mx-auto mt-8 flex flex-wrap justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        <ZoomIn className="h-4 w-4 text-primary" />
                        <span>Cistoscopia</span>
                    </div>
                     <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        <FlaskConical className="h-4 w-4 text-primary" />
                        <span>Uroflujometría</span>
                    </div>
                     <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                        <HeartPulse className="h-4 w-4 text-primary" />
                        <span>Resonancia multiparamétrica</span>
                    </div>
                </motion.div>
                <motion.div variants={fadeIn} className="mt-12">
                    <Button asChild>
                        <Link href="/estudios">Ver todos los estudios</Link>
                    </Button>
                </motion.div>
            </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <footer className="py-20 text-center md:py-32 bg-gray-50 dark:bg-gray-900/50">
        <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer}>
                <motion.h2 variants={fadeIn} className="text-4xl font-extrabold md:text-5xl font-headline">¿Listo para mejorar tu salud?</motion.h2>
                <motion.p variants={fadeIn} className="max-w-xl mx-auto mt-4 text-lg text-muted-foreground">
                    Afíliate a UroVital y accede a nuestros beneficios exclusivos.
                </motion.p>
                <motion.div variants={fadeIn} className="mt-8">
                    <Button size="lg" asChild className="bg-primary-landing hover:bg-primary-landing/90">
                        <Link href="/planes">Afíliate Ahora</Link>
                    </Button>
                </motion.div>
            </motion.div>
        </div>
      </footer>
    </div>
  );
}
