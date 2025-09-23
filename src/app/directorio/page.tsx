
'use client';

import { useState, useMemo } from 'react';
import type { Doctor } from '@/lib/types';
import { getDoctors } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Stethoscope, User, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const glowStyles = [
    "hover:shadow-[0_0_20px_rgba(58,109,255,0.3),0_0_40px_rgba(186,85,211,0.25)]",
    "hover:shadow-[0_0_20px_rgba(0,255,128,0.25),0_0_40px_rgba(0,128,255,0.25)]",
    "hover:shadow-[0_0_20px_rgba(255,165,0,0.25),0_0_40px_rgba(255,105,180,0.25)]",
    "hover:shadow-[0_0_20px_rgba(255,215,0,0.25),0_0_40px_rgba(255,69,0,0.25)]",
    "hover:shadow-[0_0_20px_rgba(75,0,130,0.25),0_0_40px_rgba(238,130,238,0.25)]",
]

export default function DirectoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    useState(() => {
        getDoctors().then(setDoctors);
    });

    const filteredDoctors = useMemo(() => {
        if (!searchTerm) return doctors;
        return doctors.filter(doc =>
            doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.especialidad.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, doctors]);
    
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    };

    return (
        <div className="w-full bg-background text-foreground font-body">
             <header className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-background/80 backdrop-blur-md">
                <Link href="/landing" className="flex items-center gap-2 font-bold text-lg">
                    <Stethoscope className="h-7 w-7 text-primary-landing" />
                    <span className="font-headline text-primary-landing">UroVital</span>
                </Link>
                <Button asChild variant="ghost">
                    <Link href="/login">Iniciar Sesión</Link>
                </Button>
            </header>

            <main className="container mx-auto px-4 pt-28 pb-20">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl font-headline">Directorio Médico</h1>
                    <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">Encuentra al especialista que necesitas.</p>
                </div>

                <div className="relative w-full max-w-lg mx-auto mb-12">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nombre o especialidad..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-12 h-12 text-base rounded-full shadow-sm"
                    />
                </div>

                <AnimatePresence>
                    <motion.div
                        key={searchTerm}
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredDoctors.map((doc, index) => (
                            <motion.div key={doc.nombre + index} variants={itemVariants}>
                                <Card className={cn(
                                    "flex flex-col h-full rounded-2xl shadow-sm transition-all duration-300 ease-in-out bg-card/50",
                                    glowStyles[index % glowStyles.length]
                                )}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <User className="h-6 w-6 text-primary" />
                                            </div>
                                            <span className="text-lg">{doc.nombre}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
                                        <p className="flex items-start gap-2">
                                            <Stethoscope className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span className='font-semibold text-foreground'>{doc.especialidad}</span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>{doc.area}</span>
                                        </p>
                                         <p className="flex items-start gap-2">
                                            <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>{doc.contacto || 'No disponible'}</span>
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
                
                 {filteredDoctors.length === 0 && (
                    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center py-16 text-muted-foreground col-span-full">
                        <Search className="mx-auto h-10 w-10 mb-4" />
                        <p className="font-semibold">No se encontraron resultados</p>
                        <p>Intenta con otro término de búsqueda.</p>
                    </motion.div>
                )}

            </main>
            
            <footer className="py-12 bg-gray-50 dark:bg-gray-900/50">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} UroVital. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
