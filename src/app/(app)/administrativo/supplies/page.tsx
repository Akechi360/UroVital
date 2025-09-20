import { getSupplies } from '@/lib/actions';
import { PageHeader } from '@/components/shared/page-header';
import SupplyListWrapper from '@/components/admin/supplies/supply-list-wrapper';

export default async function SuppliesPage() {
  const initialSupplies = await getSupplies();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Suministros" />
      <SupplyListWrapper initialSupplies={initialSupplies} />
    </div>
  );
}
