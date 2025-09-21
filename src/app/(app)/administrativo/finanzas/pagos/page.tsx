import { getPayments, getPatients, getCompanies, getPaymentTypes, getPaymentMethods } from '@/lib/actions';
import { PageHeader } from '@/components/shared/page-header';
import { DirectPayments } from '@/components/admin/finance/direct-payments';

export default async function DirectPaymentsPage() {
  const [initialPayments, patients, companies, paymentTypes, paymentMethods] = await Promise.all([
    getPayments(),
    getPatients(),
    getCompanies(),
    getPaymentTypes(),
    getPaymentMethods(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Pagos Directos" />
      <DirectPayments 
        initialPayments={initialPayments}
        patients={patients}
        companies={companies}
        paymentTypes={paymentTypes}
        paymentMethods={paymentMethods}
      />
    </div>
  );
}
