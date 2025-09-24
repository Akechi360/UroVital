'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Payment, Patient, Company, PaymentType, PaymentMethod } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { getInitials } from '@/lib/utils';
import { Search, PlusCircle, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

const ITEMS_PER_PAGE = 8;

interface DirectPaymentsTableProps {
  initialPayments: Payment[];
  patients: Patient[];
  companies: Company[];
  paymentTypes: PaymentType[];
  paymentMethods: PaymentMethod[];
}

const statusColors = {
  Pagado: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700/60',
  Pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700/60',
  Anulado: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-700/60',
};

export function DirectPaymentsTable({ 
    initialPayments, 
    patients: allPatients,
    companies: allCompanies,
    paymentTypes: allPaymentTypes,
    paymentMethods: allPaymentMethods 
}: DirectPaymentsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const patientMap = useMemo(() => new Map(allPatients.map(p => [p.id, p])), [allPatients]);
  const companyMap = useMemo(() => new Map(allCompanies.map(c => [c.id, c.name])), [allCompanies]);
  const paymentTypeMap = useMemo(() => new Map(allPaymentTypes.map(pt => [pt.id, pt.name])), [allPaymentTypes]);
  const paymentMethodMap = useMemo(() => new Map(allPaymentMethods.map(pm => [pm.id, pm.name])), [allPaymentMethods]);

  const filteredPayments = useMemo(() => {
    if (!initialPayments) return [];
    return initialPayments.filter(payment => {
      const patient = patientMap.get(payment.patientId);
      return (
        patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [initialPayments, searchTerm, patientMap]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Registrar Pago
        </Button>
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
                  <TableHead>Paciente</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPayments.map((payment) => {
                  const patient = patientMap.get(payment.patientId);
                  const paymentType = paymentTypeMap.get(payment.paymentTypeId);
                  const paymentMethod = paymentMethodMap.get(payment.paymentMethodId);
                  return (
                    <motion.tr
                      key={payment.id}
                      variants={itemVariants}
                      layout
                      className="group"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            {patient?.avatarUrl && <AvatarImage src={patient.avatarUrl} alt={patient.name} />}
                            <AvatarFallback>{getInitials(patient?.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                             <span className="font-medium">{patient?.name || 'N/A'}</span>
                             <p className="text-xs text-muted-foreground">{payment.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{paymentType || 'N/A'}</TableCell>
                      <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-semibold">${payment.monto.toFixed(2)}</TableCell>
                      <TableCell>{paymentMethod || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={cn('font-medium', statusColors[payment.status])}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className='h-8 w-8'>
                               <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem>Ver detalle</DropdownMenuItem>
                            <DropdownMenuItem>Marcar como Pagado</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">Anular</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })}
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
            {paginatedPayments.map((payment) => {
               const patient = patientMap.get(payment.patientId);
               const paymentType = paymentTypeMap.get(payment.paymentTypeId);
               const paymentMethod = paymentMethodMap.get(payment.paymentMethodId);
              return (
              <motion.div
                key={payment.id}
                variants={itemVariants}
                layout
                className={cn(
                  "relative rounded-2xl bg-card p-4 shadow-md transition-all duration-300 ease-in-out active:scale-[0.99]",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {patient?.avatarUrl && <AvatarImage src={patient.avatarUrl} alt={patient.name} />}
                      <AvatarFallback>{getInitials(patient?.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold">{patient?.name}</p>
                      <p className="text-sm text-muted-foreground">{payment.id}</p>
                    </div>
                  </div>
                  <Badge className={cn('font-medium', statusColors[payment.status])}>
                    {payment.status}
                  </Badge>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50 text-sm text-muted-foreground space-y-1">
                  <p><strong>Concepto:</strong> {paymentType || 'N/A'}</p>
                  <p><strong>Fecha:</strong> {new Date(payment.date).toLocaleDateString()}</p>
                  <p><strong>Método:</strong> {paymentMethod || 'N/A'}</p>
                  <p className="text-base font-semibold text-foreground pt-1">Monto: ${payment.monto.toFixed(2)}</p>
                </div>
              </motion.div>
            )})}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {filteredPayments.length === 0 && (
        <div className="text-center py-16 text-muted-foreground col-span-full">
          <Search className="mx-auto h-10 w-10 mb-2" />
          No se encontraron pagos.
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
