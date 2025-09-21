'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/store/finance-store';
import { motion } from 'framer-motion';
import { Search, Plus, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { AddPaymentTypeForm } from './add-payment-type-form';
import type { PaymentType } from '@/lib/types';

export function PaymentTypesList({ initialData }: { initialData: PaymentType[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { paymentTypes, setPaymentTypes, isInitialized } = useFinanceStore();

  if (!isInitialized) {
    setPaymentTypes(initialData);
  }

  const filteredItems = useMemo(() => {
    return paymentTypes.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [paymentTypes, searchTerm]);
  
  const formatCurrency = (amount?: number) => {
    if (typeof amount !== 'number') return 'N/A';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tipos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Tipo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Agregar Nuevo Tipo de Pago</DialogTitle>
                    <DialogDescription>
                        Complete el formulario para registrar un nuevo concepto de pago.
                    </DialogDescription>
                </DialogHeader>
                <AddPaymentTypeForm onSuccess={() => setIsModalOpen(false)} />
            </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Monto Predeterminado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <motion.tr
                key={item.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <TableCell className="font-medium flex items-center gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    {item.name}
                </TableCell>
                <TableCell className="text-muted-foreground">{item.description}</TableCell>
                <TableCell className="font-semibold">
                  {formatCurrency(item.defaultAmount)}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
        {filteredItems.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
                <Search className="mx-auto h-10 w-10 mb-2" />
                No se encontraron tipos de pago.
            </div>
        )}
      </div>
    </div>
  );
}
