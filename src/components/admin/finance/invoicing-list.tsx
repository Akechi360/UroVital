'use client';

import { useState, useMemo } from 'react';
import { useFinanceStore } from '@/lib/store/finance-store';
import { motion } from 'framer-motion';
import { Search, FileText, User, Building, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Payment, Patient, Company, PaymentType } from '@/lib/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { Badge } from '@/components/ui/badge';

interface InvoicingListProps {
  initialPayments: Payment[];
  patients: Patient[];
  companies: Company[];
  paymentTypes: PaymentType[];
}

const statusConfig = {
    Completado: { icon: CheckCircle, color: 'text-success' },
    Pendiente: { icon: Clock, color: 'text-yellow-500' },
    Fallido: { icon: XCircle, color: 'text-destructive' },
}

export function InvoicingList({ 
    initialPayments,
    patients,
    companies,
    paymentTypes,
}: InvoicingListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const { payments, setPayments, isInitialized } = useFinanceStore();

  if (!isInitialized) {
    setPayments(initialPayments);
  }

  const entitiesMap = useMemo(() => {
    const map = new Map<string, {name: string, type: 'patient' | 'company' }>();
    patients.forEach(p => map.set(p.id, { name: p.name, type: 'patient' }));
    companies.forEach(c => map.set(c.id, { name: c.name, type: 'company' }));
    return map;
  }, [patients, companies]);

  const typesMap = useMemo(() => new Map(paymentTypes.map(t => [t.id, t.name])), [paymentTypes]);

  const filteredItems = useMemo(() => {
    return payments.filter((item) => {
        const entity = entitiesMap.get(item.entityId);
        return entity?.name.toLowerCase().includes(searchTerm.toLowerCase()) && item.status === 'Completado';
    });
  }, [payments, searchTerm, entitiesMap]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  }

  const handleGenerateInvoice = (payment: Payment) => {
    const entity = entitiesMap.get(payment.entityId);
    if (!entity) return;

    const doc = new jsPDF();
    const margin = 14;

    // Encabezado
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("UroVital Clínica", margin, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Av. Universidad 123, Ciudad de México", margin, 26);
    doc.text("contacto@urovital.com | 55-1234-5678", margin, 30);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Factura", doc.internal.pageSize.getWidth() - margin, 20, { align: "right" });
    
    let y = 45;
    
    // Datos del cliente
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Facturar a:", margin, y);
    y+=6;
    doc.setFont("helvetica", "normal");
    doc.text(entity.name, margin, y);
    y+=5;
    doc.text(entity.type === 'patient' ? "Paciente" : "Empresa", margin, y);

    // Datos de la factura
    const invoiceDetailsY = y - 11;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Fecha:", doc.internal.pageSize.getWidth() - 50, invoiceDetailsY);
    doc.setFont("helvetica", "normal");
    doc.text(format(new Date(payment.date), 'dd/MM/yyyy'), doc.internal.pageSize.getWidth() - margin, invoiceDetailsY, { align: 'right' });
    doc.setFont("helvetica", "bold");
    doc.text("ID Factura:", doc.internal.pageSize.getWidth() - 50, invoiceDetailsY + 6);
    doc.setFont("helvetica", "normal");
    doc.text(payment.id.toUpperCase(), doc.internal.pageSize.getWidth() - margin, invoiceDetailsY + 6, { align: 'right' });

    y += 15;

    // Tabla de conceptos
    autoTable(doc, {
        startY: y,
        head: [['Concepto', 'Monto']],
        body: [[
            typesMap.get(payment.paymentTypeId) || 'Concepto no encontrado',
            formatCurrency(payment.amount)
        ]],
        headStyles: { fillColor: [58, 109, 255] },
        didDrawPage: (data) => {
            // Total
            const totalY = (data.cursor?.y || 0) + 10;
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Total:", data.settings.margin.left, totalY);
            doc.text(formatCurrency(payment.amount), doc.internal.pageSize.getWidth() - data.settings.margin.right, totalY, { align: 'right' });
        }
    });

    // Pie de página
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Este documento no requiere firma para ser válido.", doc.internal.pageSize.getWidth()/2, pageHeight - 15, { align: 'center' });
    doc.text("Gracias por su preferencia.", doc.internal.pageSize.getWidth()/2, pageHeight - 10, { align: 'center' });

    doc.save(`factura_${entity.name.replace(/\s/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);

    toast({
        title: "Factura Generada",
        description: `Se ha descargado la factura para ${entity.name}.`
    });
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
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Entidad</TableHead>
              <TableHead>Concepto</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
               const entity = entitiesMap.get(item.entityId);
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
                    <TableCell>{format(new Date(item.date), 'dd/MM/yyyy HH:mm')}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleGenerateInvoice(item)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Generar Factura
                        </Button>
                    </TableCell>
                </motion.tr>
               )
            })}
          </TableBody>
        </Table>
        {filteredItems.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
                <Search className="mx-auto h-10 w-10 mb-2" />
                No se encontraron pagos completados para facturar.
            </div>
        )}
      </div>
    </div>
  );
}
