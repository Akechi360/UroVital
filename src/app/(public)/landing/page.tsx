
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Check, Users, ShieldCheck, HeartPulse, Bone, FlaskConical, ZoomIn, Play, MessageSquare, Phone, MapPin, Ambulance, Microscope, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const fadeIn = (delay: number = 0) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      delay,
    },
  },
});

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

// TODO: Define final content for these cards or remove if redundant
const serviceCards = [
    { title: "Consultas ilimitadas", icon: Users, description: "Chatea con nuestro equipo médico en cualquier momento." },
    { title: "Cobertura de estudios", icon: Microscope, description: "Accede a radiología, uroflujometrías y más." },
    { title: "Atención prioritaria", icon: Ambulance, description: "Turnos con especialistas sin demoras y atención 24/7." },
    { title: "Seguimiento digital", icon: Clock, description: "Recordatorios y acceso rápido a tus resultados." },
]

// TODO: Define final content for these steps
const processSteps = [
    { number: "01", title: "Reservá tu turno", description: "Agendá tu cita fácilmente online o por teléfono." },
    { number: "02", title: "Elegí tu especialista", description: "Revisá los perfiles y seleccioná el doctor que prefieras." },
    { number: "03", title: "Recibí la consulta", description: "Obtené un plan de cuidado personalizado de nuestros expertos." },
    { number: "04", title: "Comenzá tu tratamiento", description: "Iniciá tu camino hacia una mejor salud con nuestro apoyo." },
]

// TODO: Define final pricing and benefits for these plans
const pricingPlans = [
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
        priceSummary: "Cobertura anual entre $35.000 y $87.500",
        detailsUrl: "/planes/fondo-espiritu-santo",
    }
]

export default function LandingPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-50 to-indigo-100 dark:from-[#0D122A] dark:to-[#101633] pt-32 pb-20 md:pt-48 md:pb-28 overflow-hidden">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
              <motion.div 
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="text-center md:text-left"
              >
                  <motion.p variants={fadeIn()} className="text-primary font-semibold mb-2 text-sm uppercase tracking-widest">Bienvenido a UroVital</motion.p>
                  <motion.h1 
                      variants={fadeIn()}
                      className="text-4xl lg:text-6xl font-extrabold tracking-tight font-headline"
                  >
                      Más que un servicio de salud, <br /> un <span className="text-primary">aliado</span> para tu vida
                  </motion.h1>
                  <motion.p 
                      variants={fadeIn()}
                      className="max-w-xl mx-auto md:mx-0 mt-6 text-base lg:text-lg text-muted-foreground"
                  >
                      Programación intuitiva, gestión segura y resultados médicos integrados.
                  </motion.p>
                  
              </motion.div>
              <div className="relative mt-8 md:mt-0">
                  <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
                      className="relative"
                  >
                      <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl"></div>
                      <Image 
                          src="/landing/doctor-hero.png" 
                          alt="Doctor" 
                          width={500} 
                          height={600}
                          className="relative rounded-t-full mx-auto"
                          priority
                      />
                       <motion.div 
                        initial={{opacity: 0, scale: 0.5, y: 50}}
                        animate={{opacity: 1, scale: 1, y: 0}}
                        transition={{duration: 0.5, delay: 0.5, ease: "easeOut"}}
                        className="absolute bottom-10 left-0 bg-white dark:bg-card shadow-lg rounded-lg p-3 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-md">
                            <ShieldCheck className="text-primary"/>
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Cuidado de Confianza</p>
                            <p className="text-xs text-muted-foreground">Especialistas Expertos</p>
                        </div>
                    </motion.div>
                  </motion.div>
              </div>
          </div>
          <div className="container mx-auto px-4 mt-16">
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={staggerContainer}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
              >
                {/* TODO: Connect to real data */}
                <motion.div variants={fadeIn()}>
                    <p className="text-4xl font-bold text-primary">1k+</p>
                    <p className="text-sm text-muted-foreground mt-1">Pacientes Registrados</p>
                </motion.div>
                <motion.div variants={fadeIn()}>
                    <p className="text-4xl font-bold text-primary">2</p>
                    <p className="text-sm text-muted-foreground mt-1">Planes Activos</p>
                </motion.div>
                <motion.div variants={fadeIn()}>
                    <p className="text-4xl font-bold text-primary">30+</p>
                    <p className="text-sm text-muted-foreground mt-1">Especialistas en la Red</p>
                </motion.div>
                <motion.div variants={fadeIn()}>
                    <p className="text-4xl font-bold text-primary">500+</p>
                    <p className="text-sm text-muted-foreground mt-1">Estudios Almacenados</p>
                </motion.div>
              </motion.div>
          </div>
      </section>

      {/* Exceptional Care Section */}
       <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeIn()}>
                        <p className="text-primary font-semibold text-sm uppercase mb-2">Beneficios</p>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Más salud por menos dinero</h2>
                        <p className="text-muted-foreground mb-6">
                            Beneficios de contar con un plan integral UroVital.
                        </p>
                         <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                                <div className="p-3 bg-primary/10 rounded-full"><MessageSquare className="text-primary"/></div>
                                <div>
                                    <h3 className="font-semibold">Consultas gratuitas</h3>
                                    <p className="text-sm text-muted-foreground">Chateá con el equipo en cualquier momento.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                                <div className="p-3 bg-primary/10 rounded-full"><FlaskConical className="text-primary"/></div>
                                <div>
                                    <h3 className="font-semibold">Cobertura en estudios</h3>
                                    <p className="text-sm text-muted-foreground">Radiología, uroflujometrías y más con descuentos preferenciales.</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                                <div className="p-3 bg-primary/10 rounded-full"><Stethoscope className="text-primary"/></div>
                                <div>
                                    <h3 className="font-semibold">Atención en consultorios</h3>
                                    <p className="text-sm text-muted-foreground">Reservá turnos con especialistas sin demoras.</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                                <div className="p-3 bg-primary/10 rounded-full"><HeartPulse className="text-primary"/></div>
                                <div>
                                    <h3 className="font-semibold">Asistencia y seguimiento 24/7</h3>
                                    <p className="text-sm text-muted-foreground">Recordatorios automáticos y acceso rápido a tus resultados.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div initial={{opacity: 0, scale: 0.9}} whileInView={{opacity: 1, scale: 1}} viewport={{once: true}} transition={{duration: 0.6}} className="relative">
                        <Image src="/landing/care-image.png" width={500} height={500} alt="Cuidado Excepcional" className="rounded-lg shadow-xl" />
                    </motion.div>
                </div>
            </div>
        </section>

      {/* Outstanding Service Section */}
      <section className="py-20 md:py-28 bg-blue-50 dark:bg-[#0D122A]">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer} className="text-center max-w-2xl mx-auto">
            <motion.p variants={fadeIn()} className="text-primary font-semibold text-sm uppercase mb-2">Nuestros Servicios</motion.p>
            <motion.h2 variants={fadeIn()} className="text-3xl md:text-4xl font-bold font-headline mb-4">Servicios que superan tus expectativas</motion.h2>
          </motion.div>

          <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, amount: 0.2 }} 
              variants={staggerContainer} 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12"
          >
            {serviceCards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <motion.div variants={fadeIn()} key={index}>
                        <Card className="text-center p-6 h-full border-b-4 border-transparent hover:border-primary transition-all duration-300">
                             <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
                                <Icon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="font-bold text-lg mb-2">{card.title}</h3>
                            <p className="text-sm text-muted-foreground">{card.description}</p>
                        </Card>
                    </motion.div>
                )
            })}
          </motion.div>
        </div>
      </section>

      {/* Simplified Processes Section */}
      <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                   <motion.div initial={{opacity: 0, scale: 0.9}} whileInView={{opacity: 1, scale: 1}} viewport={{once: true}} transition={{duration: 0.6}} className="relative">
                        <Image src="/landing/process-image.jpg" width={500} height={600} alt="Procesos Simplificados" className="rounded-lg shadow-xl" />
                    </motion.div>
                   <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeIn()}>
                        <p className="text-primary font-semibold text-sm uppercase mb-2">Cómo funciona</p>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-8">Procesos simples y efectivos</h2>
                        <div className="space-y-6">
                            {processSteps.map((step, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                                        {step.number}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{step.title}</h3>
                                        <p className="text-sm text-muted-foreground">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
              </div>
          </div>
      </section>

      {/* Journey to Health Section */}
      <section className="py-20 md:py-28 bg-gray-50 dark:bg-[#0D122A]">
        <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
                 <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeIn()}>
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">Nuestras Especialidades</h2>
                    <p className="text-muted-foreground mb-6">
                        Un equipo multidisciplinario dedicado a tu bienestar integral.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3"><Check className="text-primary h-5 w-5" /> Urología</li>
                        <li className="flex items-center gap-3"><Check className="text-primary h-5 w-5" /> Ginecología</li>
                        <li className="flex items-center gap-3"><Check className="text-primary h-5 w-5" /> Oncología</li>
                        <li className="flex items-center gap-3"><Check className="text-primary h-5 w-5" /> Medicina Interna</li>
                    </ul>
                </motion.div>
                 <motion.div initial={{opacity: 0, scale: 0.9}} whileInView={{opacity: 1, scale: 1}} viewport={{once: true}} transition={{duration: 0.6}} className="relative">
                    <Image src="/landing/journey-image.jpg" width={600} height={400} alt="Viaje a la Salud" className="rounded-lg shadow-xl" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Button variant="ghost" size="icon" className="h-20 w-20 bg-white/30 backdrop-blur-sm rounded-full hover:bg-white/50">
                            <Play className="h-10 w-10 text-white fill-white" />
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer} className="text-center max-w-2xl mx-auto">
                <motion.p variants={fadeIn()} className="text-primary font-semibold text-sm uppercase mb-2">Planes de Precios</motion.p>
                <motion.h2 variants={fadeIn()} className="text-3xl md:text-4xl font-bold font-headline mb-4">Elegí el plan perfecto para vos</motion.h2>
            </motion.div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch mt-12">
            {pricingPlans.map((plan, index) => (
                <motion.div
                    key={plan.name}
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn(0.2 * (index + 1))}
                    className="flex"
                >
                        <Card className={cn(
                        "flex flex-col h-full w-full rounded-2xl shadow-sm transition-all duration-300 ease-in-out bg-card/50",
                        "hover:shadow-[0_0_20px_rgba(37,99,235,0.2)] dark:hover:shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                        )}>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold font-headline text-primary">{plan.name}</CardTitle>
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
                            <Button size="lg" className="w-full">
                                Afíliate Ahora
                            </Button>
                            <Button asChild size="lg" variant="outline" className="w-full">
                                <Link href={plan.detailsUrl}>Ver detalles</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            ))}
        </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-28 bg-blue-50 dark:bg-[#0D122A]">
        <div className="container mx-auto px-4 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeIn()}>
                <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">¿Listo para mejorar tu salud?</h2>
                <p className="max-w-2xl mx-auto text-muted-foreground mb-8">
                    Potenciá tu bienestar con planes flexibles y acompañamiento experto.
                </p>
                <Button size="lg" asChild>
                    <Link href="/planes">Afíliate Ahora</Link>
                </Button>
            </motion.div>
        </div>
      </section>
    </>
  );
}

    
