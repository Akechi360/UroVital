
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Estudio } from '@/lib/types';
import { getEstudios } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/shared/page-header';

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

    return (
        <main className="container mx-auto px-4 pt-28 pb-20">
            <div className="text-center mb-12">
                <PageHeader title="Estudios Urológicos" />
                <p className="max-w-2xl mx-auto mt-4 text-lg text-muted-foreground">Explora los estudios y procedimientos especializados que ofrecemos.</p>
            </div>

            <div className="relative w-full max-w-lg mx-auto mb-12">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder="Buscar por nombre..."
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
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filteredEstudios.map((estudio) => (
                        <motion.div key={estudio.id} variants={itemVariants}>
                            <Card className={cn(
                                "flex flex-col h-full rounded-2xl shadow-sm transition-all duration-300 ease-in-out bg-card/50",
                                "hover:shadow-[0_0_20px_rgba(46,49,146,0.4)]"
                            )}>
                                <CardHeader>
                                    <CardTitle className="text-base">{estudio.nombre}</CardTitle>
                                    <CardDescription>{estudio.categoria}</CardDescription>
                                </CardHeader>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>
            
                {filteredEstudios.length === 0 && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="text-center py-16 text-muted-foreground col-span-full">
                    <Search className="mx-auto h-10 w-10 mb-4" />
                    <p className="font-semibold">No se encontraron resultados</p>
                    <p>Intenta con otro término de búsqueda.</p>
                </motion.div>
            )}

        </main>
    );
}
