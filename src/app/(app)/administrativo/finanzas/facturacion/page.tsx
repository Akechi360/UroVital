import { getPayments, getPatients, getCompanies, getPaymentTypes } from '@/lib/actions';
import { PageHeader } from '@/components/shared/page-header';
import { InvoicingList } from '@/components/admin/finance/invoicing-list';

export default async function InvoicingPage() {
  const [initialPayments, patients, companies, paymentTypes] = await Promise.all([
    getPayments(),
    getPatients(),
    getCompanies(),
    getPaymentTypes(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Facturación" />
      <InvoicingList
        initialPayments={initialPayments}
        patients={patients}
        companies={companies}
        paymentTypes={paymentTypes}
      />
    </div>
  );
}
