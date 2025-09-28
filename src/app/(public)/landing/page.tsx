
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, Check, Users, ShieldCheck, HeartPulse, Bone, FlaskConical, ZoomIn, Play, MessageSquare, Phone, MapPin, Ambulance, UserMd, Microscope, Clock } from 'lucide-react';
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
      delayChildren: 0.1,
    },
  },
};

const serviceCards = [
    { title: "Emergency Care", icon: Ambulance, description: "24/7 emergency services with our expert team." },
    { title: "Expert Doctors", icon: UserMd, description: "Access to highly qualified and experienced specialists." },
    { title: "Diagnosis & Treatment", icon: Microscope, description: "Advanced diagnostic tools for accurate results." },
    { title: "24/7 Services", icon: Clock, description: "We are here for you at any time of the day." },
]

const processSteps = [
    { number: "01", title: "Book Appointment", description: "Schedule your visit with ease online or by phone." },
    { number: "02", title: "Check Doctor Profile", description: "Review our doctors' profiles and choose your specialist." },
    { number: "03", title: "Get Consultation", description: "Receive expert medical advice and a personalized care plan." },
    { number: "04", title: "Start Your Treatment", description: "Begin your journey to better health with our support." },
]

const pricingPlans = [
    { 
        name: "Basic", 
        price: 38, 
        features: ["Individual Registration", "Preventive Care", "Primary Care Visits", "Specialist Referrals", "Basic Lab Tests"], 
        isPopular: false,
        icon: Users,
    },
    { 
        name: "Popular", 
        price: 59, 
        features: ["Family Registration", "All Basic Plan Features", "Annual Health Check-up", "Priority Appointments", "Telemedicine Services"], 
        isPopular: true,
        icon: HeartPulse,
    },
    { 
        name: "Standard", 
        price: 99, 
        features: ["All Popular Plan Features", "Comprehensive Lab Tests", "Minor Surgical Procedures", "Dental and Vision Discounts", "Wellness Programs"], 
        isPopular: false,
        icon: ShieldCheck,
    },
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
                  <motion.p variants={fadeIn} className="text-primary font-semibold mb-2 text-sm uppercase tracking-widest">Welcome to UroVital</motion.p>
                  <motion.h1 
                      variants={fadeIn}
                      className="text-4xl lg:text-6xl font-extrabold tracking-tight font-headline"
                  >
                      Your Health Mission, <br /> Always <span className="text-primary">Here</span>
                  </motion.h1>
                  <motion.p 
                      variants={fadeIn}
                      className="max-w-xl mx-auto md:mx-0 mt-6 text-base lg:text-lg text-muted-foreground"
                  >
                      Our team of highly trained professionals uses the latest healing technologies to restore you to pain-free health quickly and easily.
                  </motion.p>
                  <motion.div variants={fadeIn} className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                      <Button size="lg" asChild>
                          <Link href="#">Make Appointment</Link>
                      </Button>
                      <Button size="lg" variant="outline" asChild>
                          <Link href="#">Contact Us</Link>
                      </Button>
                  </motion.div>
                  
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
                            <p className="font-semibold text-sm">Trusted Care</p>
                            <p className="text-xs text-muted-foreground">Expert Specialists</p>
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
                <motion.div variants={fadeIn}>
                    <p className="text-4xl font-bold text-primary">15+</p>
                    <p className="text-sm text-muted-foreground mt-1">Years of Experience</p>
                </motion.div>
                <motion.div variants={fadeIn}>
                    <p className="text-4xl font-bold text-primary">150+</p>
                    <p className="text-sm text-muted-foreground mt-1">Expert Doctors</p>
                </motion.div>
                <motion.div variants={fadeIn}>
                    <p className="text-4xl font-bold text-primary">650+</p>
                    <p className="text-sm text-muted-foreground mt-1">Medical Beds</p>
                </motion.div>
                <motion.div variants={fadeIn}>
                    <p className="text-4xl font-bold text-primary">730+</p>
                    <p className="text-sm text-muted-foreground mt-1">Happy Patients</p>
                </motion.div>
              </motion.div>
          </div>
      </section>

      {/* Exceptional Care Section */}
       <section className="py-20 md:py-28">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeIn}>
                        <p className="text-primary font-semibold text-sm uppercase mb-2">About Us</p>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4">Dedicated To Delivering Exceptional Care</h2>
                        <p className="text-muted-foreground mb-6">
                            We are committed to providing the highest quality of care to our patients, ensuring their health and well-being are our top priority.
                        </p>
                         <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                                <div className="p-3 bg-primary/10 rounded-full"><HeartPulse className="text-primary"/></div>
                                <div>
                                    <h3 className="font-semibold">Patient-Centered Approach</h3>
                                    <p className="text-sm text-muted-foreground">Every decision and action is centered around our patients' needs.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
                                <div className="p-3 bg-primary/10 rounded-full"><Stethoscope className="text-primary"/></div>
                                <div>
                                    <h3 className="font-semibold">Advanced Technology</h3>
                                    <p className="text-sm text-muted-foreground">Utilizing state-of-the-art medical technology for better outcomes.</p>
                                </div>
                            </div>
                        </div>
                         <Button asChild size="lg" className="mt-8"><Link href="#">Learn More</Link></Button>
                    </motion.div>
                    <motion.div initial={{opacity: 0, scale: 0.9}} whileInView={{opacity: 1, scale: 1}} viewport={{once: true}} transition={{duration: 0.6}} className="relative">
                        <Image src="/landing/care-image.png" width={500} height={500} alt="Exceptional Care" className="rounded-lg shadow-xl" />
                    </motion.div>
                </div>
            </div>
        </section>

      {/* Outstanding Service Section */}
      <section className="py-20 md:py-28 bg-blue-50 dark:bg-[#0D122A]">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} variants={staggerContainer} className="text-center max-w-2xl mx-auto">
            <motion.p variants={fadeIn} className="text-primary font-semibold text-sm uppercase mb-2">Our Services</motion.p>
            <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold font-headline mb-4">Outstanding Service That Exceeds Expectations</motion.h2>
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
                    <motion.div variants={fadeIn} key={index}>
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
                        <Image src="/landing/process-image.jpg" width={500} height={600} alt="Simplified Processes" className="rounded-lg shadow-xl" />
                    </motion.div>
                   <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeIn}>
                        <p className="text-primary font-semibold text-sm uppercase mb-2">How it Works</p>
                        <h2 className="text-3xl md:text-4xl font-bold font-headline mb-8">Simplified & Effective Processes</h2>
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
                 <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }} variants={fadeIn}>
                    <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">Your Journey To Better Health Starts Here</h2>
                    <p className="text-muted-foreground mb-6">
                        We provide a seamless and supportive experience from the moment you book an appointment to your full recovery.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3"><Check className="text-primary h-5 w-5" /> Comprehensive care from expert doctors.</li>
                        <li className="flex items-center gap-3"><Check className="text-primary h-5 w-5" /> State-of-the-art medical facilities.</li>
                        <li className="flex items-center gap-3"><Check className="text-primary h-5 w-5" /> Personalized treatment plans.</li>
                    </ul>
                </motion.div>
                 <motion.div initial={{opacity: 0, scale: 0.9}} whileInView={{opacity: 1, scale: 1}} viewport={{once: true}} transition={{duration: 0.6}} className="relative">
                    <Image src="/landing/journey-image.jpg" width={600} height={400} alt="Journey to Health" className="rounded-lg shadow-xl" />
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
                <motion.p variants={fadeIn} className="text-primary font-semibold text-sm uppercase mb-2">Pricing Plans</motion.p>
                <motion.h2 variants={fadeIn} className="text-3xl md:text-4xl font-bold font-headline mb-4">Choose A Plan That's Right For You</motion.h2>
            </motion.div>
             <motion.div 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true, amount: 0.2 }} 
                variants={staggerContainer} 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 items-end"
            >
                {pricingPlans.map((plan, index) => {
                    const Icon = plan.icon;
                    return (
                        <motion.div variants={fadeIn} key={index} className={plan.isPopular ? "transform lg:-translate-y-4" : ""}>
                            <Card className={`h-full flex flex-col ${plan.isPopular ? 'border-primary border-2 shadow-2xl shadow-primary/20' : ''}`}>
                                {plan.isPopular && <div className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider text-center py-1 rounded-t-lg">Best Value</div>}
                                <CardHeader className="text-center">
                                    <div className="inline-block p-3 bg-primary/10 rounded-full mb-2 mx-auto"><Icon className="w-7 h-7 text-primary" /></div>
                                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                    <p className="text-4xl font-bold text-primary">${plan.price}<span className="text-lg font-normal text-muted-foreground">/year</span></p>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <ul className="space-y-3 text-sm">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center gap-3">
                                                <Check className="h-4 w-4 text-green-500" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <div className="p-6">
                                     <Button className="w-full" variant={plan.isPopular ? 'default' : 'outline'}>Choose Plan</Button>
                                </div>
                            </Card>
                        </motion.div>
                    )
                })}
            </motion.div>
        </div>
      </section>
    </>
  );
}
