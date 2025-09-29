
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Estudio } from '@/lib/types';
import { getEstudios } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function EstudiosPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [estudios, setEstudios] = useState<Estudio[]>([]);

    useEffect(() => {
        getEstudios().then(setEstudios);
    }, []);

    const filteredEstudios = useMemo(() => {
        if (!searchTerm) return estudios;
        return estudios.filter(est =>
            est.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, estudios]);
    
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.03,
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
                    <h1 className="text-4xl font-bold text-primary font-headline">Estudios urológicos</h1>
                </div>

                 <div className="relative w-full max-w-lg mx-auto mb-12">
                    <Card className='bg-white/90 dark:bg-[#101633] border border-primary/20 shadow-lg'>
                        <CardContent className='p-2'>
                             <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/70" />
                                <Input
                                    placeholder="Buscar por nombre..."
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
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredEstudios.map((estudio) => (
                            <motion.div key={estudio.id} variants={itemVariants}>
                                <Card className={cn(
                                    "flex flex-col h-full rounded-2xl transition-all duration-300 ease-in-out backdrop-blur",
                                    "bg-white/85 dark:bg-[#0D122A] border border-primary/15 hover:border-primary/40",
                                    "shadow-[0_20px_45px_-25px_rgba(37,99,235,0.45)]"
                                )}>
                                    <CardHeader className="flex-grow flex justify-center items-center">
                                        <CardTitle className="text-lg font-semibold text-primary text-center">{toSentenceCase(estudio.nombre)}</CardTitle>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
                
                    {filteredEstudios.length === 0 && (
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
