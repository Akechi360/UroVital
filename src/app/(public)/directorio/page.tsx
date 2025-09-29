
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Doctor } from '@/lib/types';
import { getDoctors } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Stethoscope, User, MapPin, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function DirectoryPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [doctors, setDoctors] = useState<Doctor[]>([]);

    useEffect(() => {
        getDoctors().then(setDoctors);
    }, []);

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

    const toSentenceCase = (str: string) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };


    return (
        <section className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-sky-100 dark:from-[#0D122A] dark:to-[#101633] pt-16 pb-20">
            <main className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-primary font-headline">Directorio médico</h1>
                </div>

                <div className="relative w-full max-w-lg mx-auto mb-12">
                    <Card className='bg-white/90 dark:bg-[#101633] border border-primary/20 shadow-lg'>
                        <CardContent className='p-2'>
                             <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/70" />
                                <Input
                                    placeholder="Buscar por nombre o especialidad..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 text-base rounded-full shadow-sm bg-transparent border-0 focus-visible:ring-primary"
                                />
                             </div>
                        </CardContent>
                    </Card>
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
                                    "flex flex-col h-full rounded-2xl shadow-sm transition-all duration-300 ease-in-out backdrop-blur",
                                    "bg-white/85 dark:bg-[#0D122A] border border-primary/15 hover:border-primary/40 overflow-hidden",
                                    "relative before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-primary"
                                )}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <User className="h-6 w-6 text-primary" />
                                            </div>
                                            <span className="text-lg font-semibold text-primary">{doc.nombre}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-3 text-sm text-slate-600 dark:text-slate-300">
                                        <p className="flex items-start gap-2">
                                            <Stethoscope className="h-4 w-4 mt-0.5 shrink-0 text-primary/80" />
                                            <span className='font-semibold'>{toSentenceCase(doc.especialidad)}</span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary/80" />
                                            <span>{doc.area}</span>
                                        </p>
                                            <p className="flex items-start gap-2">
                                            <Phone className="h-4 w-4 mt-0.5 shrink-0 text-primary/80" />
                                            <span>{doc.contacto || 'No disponible'}</span>
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
                
                    {filteredDoctors.length === 0 && (
                     <motion.div 
                        initial={{opacity: 0}} 
                        animate={{opacity: 1}} 
                        className="text-center py-16 text-primary/70 col-span-full bg-primary/10 rounded-2xl"
                    >
                        <Search className="mx-auto h-10 w-10 mb-4" />
                        <p className="font-semibold">No se encontraron resultados</p>
                        <p>Intenta con otro término de búsqueda.</p>
                    </motion.div>
                )}

            </main>
        </section>
    );
}
