
import { getPayments, getPatients, getCompanies, getPaymentTypes, getPaymentMethods } from '@/lib/actions';
import { PageHeader } from '@/components/shared/page-header';
import { DirectPaymentsTable } from '@/components/finance/direct-payments-table';

export const metadata = {
  title: "Pagos Directos — UroVital",
};

export default async function PagosDirectosPage() {
    const [
        initialPayments,
        patients,
        companies,
        paymentTypes,
        paymentMethods
    ] = await Promise.all([
        getPayments(),
        getPatients(),
        getCompanies(),
        getPaymentTypes(),
        getPaymentMethods(),
    ]);
  
  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Pagos Directos" />
      <DirectPaymentsTable 
        initialPayments={initialPayments}
        patients={patients}
        companies={companies}
        paymentTypes={paymentTypes}
        paymentMethods={paymentMethods}
       />
    </div>
  );
}
