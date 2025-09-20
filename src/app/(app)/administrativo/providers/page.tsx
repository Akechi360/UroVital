import { getProviders } from '@/lib/actions';
import { PageHeader } from '@/components/shared/page-header';
import ProviderListWrapper from '@/components/admin/providers/provider-list-wrapper';

export default async function ProvidersPage() {
  const initialProviders = await getProviders();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Proveedores" />
      <ProviderListWrapper initialProviders={initialProviders} />
    </div>
  );
}
