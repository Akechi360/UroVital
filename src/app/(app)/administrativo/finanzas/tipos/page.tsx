'use client';
import { getPaymentTypes } from '@/lib/actions';
import { PageHeader } from '@/components/shared/page-header';
import { PaymentTypesList } from '@/components/admin/finance/payment-types-list';
import { useAuth } from '@/components/layout/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldBan } from 'lucide-react';
import React from 'react';
import type { PaymentType } from '@/lib/types';

function DeniedAccess() {
    return (
        <Card>
            <CardContent className="p-10 flex flex-col items-center justify-center gap-4 text-center">
                <ShieldBan className="h-12 w-12 text-destructive" />
                <h3 className="text-xl font-semibold">Acceso Denegado</h3>
                <p className="text-muted-foreground">No tienes permiso para ver esta sección.</p>
            </CardContent>
        </Card>
    )
}

export default function PaymentTypesPage() {
  const { can } = useAuth();
  const [initialData, setInitialData] = React.useState<PaymentType[] | null>(null);

  React.useEffect(() => {
    if (can('admin:all') || can('finance:write')) {
      getPaymentTypes().then(setInitialData);
    }
  }, [can]);

  if (!can('admin:all') && !can('finance:write')) {
    return <DeniedAccess />;
  }

  if (!initialData) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Tipos de Pago" />
      <PaymentTypesList initialData={initialData} />
    </div>
  );
}