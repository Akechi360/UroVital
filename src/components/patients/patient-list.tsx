'use client';

import { useState, useMemo } from 'react';
import type { Patient } from '@/lib/types';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { getInitials } from '@/lib/utils';
import { Search, UserPlus, Filter, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Label } from '../ui/label';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PatientListProps {
  patients: Patient[];
}

const ITEMS_PER_PAGE = 5;

const glowStyles = [
    "hover:shadow-[0_0_20px_rgba(0,255,128,0.25),0_0_40px_rgba(0,128,255,0.25)]",
    "hover:shadow-[0_0_20px_rgba(58,109,255,0.3),0_0_40px_rgba(186,85,211,0.25)]",
    "hover:shadow-[0_0_20px_rgba(255,165,0,0.25),0_0_40px_rgba(255,105,180,0.25)]",
    "hover:shadow-[0_0_20px_rgba(255,215,0,0.25),0_0_40px_rgba(255,69,0,0.25)]",
    "hover:shadow-[0_0_20px_rgba(75,0,130,0.25),0_0_40px_rgba(238,130,238,0.25)]",
]

export default function PatientList({ patients }: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [currentPage, setCurrentPage] = useState(1);

  const router = useRouter();
  const { toast } = useToast();

  const handleExport = () => {
    try {
      const doc = new jsPDF();

      // Encabezado
      doc.setFontSize(18);
      doc.text("Lista de Pacientes - UroVital", 14, 20);
      doc.setFontSize(12);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 30);

      // Crear tabla con los datos
      autoTable(doc, {
        startY: 40,
        head: [['ID', 'Nombre', 'Edad', 'Sexo', 'Teléfono', 'Email']],
        body: patients.map(p => [
          p.id,
          p.name,
          p.age,
          p.gender,
          p.contact.phone || "N/A",
          p.contact.email || "N/A"
        ]),
      });

      // Descargar archivo
      doc.save("Lista_Pacientes.pdf");
      
      toast({
        title: "Exportación completada",
        description: "La descarga de la lista de pacientes ha comenzado.",
      });

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error en la exportación",
        description: "No se pudo generar el archivo PDF.",
      });
      console.error("Failed to export patients list:", error);
    }
  };

  const filteredPatients = useMemo(() => {
    let filtered = patients;

    if (searchTerm) {
        filtered = filtered.filter((patient) =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    if (genderFilter !== 'Todos') {
        filtered = filtered.filter((patient) => patient.gender === genderFilter);
    }

    if (statusFilter !== 'Todos') {
        filtered = filtered.filter((patient) => patient.status === statusFilter);
    }
    
    setCurrentPage(1);

    return filtered;
  }, [patients, searchTerm, genderFilter, statusFilter]);

  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePatientClick = (patient: Patient) => {
    toast({ title: "Paciente seleccionado", description: patient.name });
    router.push(`/patients/${patient.id}`);
  };

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
    exit: { opacity: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex-1 w-full flex gap-4">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                    placeholder="Buscar pacientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                    />
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            <Filter className="mr-2 h-4 w-4" />
                            Filtros
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">Filtros</h4>
                                <p className="text-sm text-muted-foreground">
                                Ajusta los filtros para refinar la lista de pacientes.
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="gender">Género</Label>
                                    <Select value={genderFilter} onValueChange={setGenderFilter}>
                                        <SelectTrigger className="w-full sm:w-[180px] bg-card/50 backdrop-blur-lg col-span-2">
                                            <SelectValue placeholder="Filtrar por género" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Todos">Todos los Géneros</SelectItem>
                                            <SelectItem value="Masculino">Masculino</SelectItem>
                                            <SelectItem value="Femenino">Femenino</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <Label htmlFor="status">Estado</Label>
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="w-full sm:w-[180px] bg-card/50 backdrop-blur-lg col-span-2">
                                            <SelectValue placeholder="Filtrar por estado" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Todos">Todos los Estados</SelectItem>
                                            <SelectItem value="Activo">Activo</SelectItem>
                                            <SelectItem value="Inactivo">Inactivo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
                <Button variant="outline" size="icon" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                </Button>
            </div>
            <Button className="w-full sm:w-auto">
                <UserPlus className="mr-2 h-4 w-4" />
                Agregar Paciente
            </Button>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
            key={currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Desktop Table */}
            <motion.div 
                className="hidden md:block rounded-lg border bg-card"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Género</TableHead>
                    <TableHead>Última Visita</TableHead>
                    <TableHead>Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedPatients.map((patient, index) => (
                    <motion.tr
                        key={patient.id}
                        variants={itemVariants}
                        layout
                        onClick={() => handlePatientClick(patient)}
                        className={cn(
                            "cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.01]",
                            glowStyles[index % glowStyles.length]
                        )}
                    >
                        <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar>
                            {patient.avatarUrl && <AvatarImage src={patient.avatarUrl} alt={patient.name} />}
                            <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{patient.name}</span>
                        </div>
                        </TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.lastVisit || 'N/A'}</TableCell>
                        <TableCell>
                        <Badge variant={patient.status === 'Activo' ? 'success' : 'destructive'}>
                            {patient.status}
                        </Badge>
                        </TableCell>
                    </motion.tr>
                    ))}
                </TableBody>
                </Table>
            </motion.div>

            {/* Mobile Cards */}
            <motion.div 
                className="grid grid-cols-1 gap-4 md:hidden"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {paginatedPatients.map((patient, index) => (
                <motion.div
                    key={patient.id}
                    variants={itemVariants}
                    layout
                    onClick={() => handlePatientClick(patient)}
                    className={cn(
                        "rounded-2xl bg-card p-4 shadow-md transition-all duration-300 ease-in-out hover:scale-[1.03] active:scale-[0.99]",
                        glowStyles[index % glowStyles.length]
                    )}
                >
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar>
                        {patient.avatarUrl && <AvatarImage src={patient.avatarUrl} alt={patient.name} />}
                        <AvatarFallback>{getInitials(patient.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                        <p className="font-bold">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.age} años • {patient.gender}</p>
                        </div>
                    </div>
                    <Badge variant={patient.status === 'Activo' ? 'success' : 'destructive'}>
                            {patient.status}
                        </Badge>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground">
                        Última Visita: {patient.lastVisit || 'N/A'}
                    </div>
                </motion.div>
                ))}
            </motion.div>
        </motion.div>
       </AnimatePresence>

       {filteredPatients.length === 0 && (
         <div className="text-center py-16 text-muted-foreground col-span-full">
           <Search className="mx-auto h-10 w-10 mb-2" />
           No se encontraron pacientes que coincidan con los filtros.
         </div>
        )}

        {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-4 pt-4">
                <Button 
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Anterior
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                    Página {currentPage} de {totalPages}
                </span>
                <Button 
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Siguiente
                </Button>
            </div>
        )}
    </div>
  );
}

    
