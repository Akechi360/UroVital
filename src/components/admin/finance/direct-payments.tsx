'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/store/finance-store';
import { motion } from 'framer-motion';
import { Search, Plus, User, Building, Tag, CreditCard, CheckCircle, Clock, XCircle, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AddPaymentForm } from './add-payment-form';
import type { Payment, Patient, Company, PaymentMethod, PaymentType } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface DirectPaymentsProps {
  initialPayments: Payment[];
  patients: Patient[];
  companies: Company[];
  paymentTypes: PaymentType[];
  paymentMethods: PaymentMethod[];
}

const statusConfig = {
    Completado: { icon: CheckCircle, color: 'text-success' },
    Pendiente: { icon: Clock, color: 'text-yellow-500' },
    Fallido: { icon: XCircle, color: 'text-destructive' },
}

export function DirectPayments({ 
    initialPayments,
    patients,
    companies,
    paymentTypes,
    paymentMethods
}: DirectPaymentsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { payments, setPayments, isInitialized, initialize } = useFinanceStore();

  if (!isInitialized) {
    initialize({
        payments: initialPayments,
        methods: paymentMethods,
        types: paymentTypes,
    });
  }

  const entitiesMap = useMemo(() => {
    const map = new Map<string, {name: string, type: 'patient' | 'company' }>();
    patients.forEach(p => map.set(p.id, { name: p.name, type: 'patient' }));
    companies.forEach(c => map.set(c.id, { name: c.name, type: 'company' }));
    return map;
  }, [patients, companies]);

  const typesMap = useMemo(() => new Map(paymentTypes.map(t => [t.id, t.name])), [paymentTypes]);
  const methodsMap = useMemo(() => new Map(paymentMethods.map(m => [m.id, m.name])), [paymentMethods]);

  const filteredItems = useMemo(() => {
    return payments.filter((item) => {
        const entity = entitiesMap.get(item.entityId);
        return entity?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [payments, searchTerm, entitiesMap]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente/empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Pago
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Registrar Nuevo Pago Directo</DialogTitle>
                    <DialogDescription>
                        Complete el formulario para registrar un nuevo pago.
                    </DialogDescription>
                </DialogHeader>
                <AddPaymentForm 
                    patients={patients}
                    companies={companies}
                    paymentTypes={paymentTypes}
                    paymentMethods={paymentMethods}
                    onSuccess={() => setIsModalOpen(false)}
                />
            </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entidad</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
               const entity = entitiesMap.get(item.entityId);
               const status = statusConfig[item.status];
               return (
                <motion.tr
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           {entity?.type === 'patient' ? <User className="h-4 w-4 text-muted-foreground" /> : <Building className="h-4 w-4 text-muted-foreground" />}
                           {entity?.name || 'Desconocido'}
                        </div>
                    </TableCell>
                    <TableCell>{typesMap.get(item.paymentTypeId) || 'N/A'}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(item.amount)}</TableCell>
                    <TableCell>{methodsMap.get(item.paymentMethodId) || 'N/A'}</TableCell>
                    <TableCell>{format(new Date(item.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                        <Badge variant={item.status === 'Completado' ? 'success' : item.status === 'Pendiente' ? 'outline' : 'destructive'} className="flex items-center gap-1.5">
                            <status.icon className="h-3.5 w-3.5" />
                            {item.status}
                        </Badge>
                    </TableCell>
                </motion.tr>
               )
            })}
          </TableBody>
        </Table>
        {filteredItems.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
                <Search className="mx-auto h-10 w-10 mb-2" />
                No se encontraron pagos.
            </div>
        )}
      </div>
    </div>
  );
}
