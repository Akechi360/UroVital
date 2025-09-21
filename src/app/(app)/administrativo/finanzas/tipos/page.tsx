import { getPaymentTypes } from '@/lib/actions';
import { PageHeader } from '@/components/shared/page-header';
import { PaymentTypesList } from '@/components/admin/finance/payment-types-list';

export default async function PaymentTypesPage() {
  const initialData = await getPaymentTypes();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Tipos de Pago" />
      <PaymentTypesList initialData={initialData} />
    </div>
  );
}
