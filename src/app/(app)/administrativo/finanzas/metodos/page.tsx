import { getPaymentMethods } from '@/lib/actions';
import { PageHeader } from '@/components/shared/page-header';
import { PaymentMethodsList } from '@/components/admin/finance/payment-methods-list';
import type { PaymentMethod } from '@/lib/types';

export default async function PaymentMethodsPage() {
  const initialData = await getPaymentMethods();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Métodos de Pago" />
      <PaymentMethodsList initialData={initialData} />
    </div>
  );
}