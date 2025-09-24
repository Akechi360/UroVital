// src/app/(app)/finanzas/page.tsx
import { getPayments, getPatients, getPaymentTypes, getPaymentMethods, getUsers } from '@/lib/actions';
import { PageHeader } from '@/components/shared/page-header';
import { FinanceTable } from '@/components/finance/finance-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { FinanceStatCards } from '@/components/finance/stat-cards';

export const metadata = {
  title: "Finanzas — UroVital",
};

export default async function FinanzasPage() {
    const [
        initialPayments,
        patients,
        paymentTypes,
        paymentMethods,
        users,
    ] = await Promise.all([
        getPayments(),
        getPatients(),
        getPaymentTypes(),
        getPaymentMethods(),
        getUsers(),
    ]);

  const doctors = users.filter(u => u.role === 'doctor');
  
  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Finanzas"
        actions={
            <Button asChild>
                <Link href="/finanzas/nuevo">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Crear Comprobante
                </Link>
            </Button>
        }
      />
      <FinanceStatCards payments={initialPayments} />
      <FinanceTable 
        initialPayments={initialPayments}
        patients={patients}
        doctors={doctors}
        paymentTypes={paymentTypes}
        paymentMethods={paymentMethods}
       />
    </div>
  );
}
