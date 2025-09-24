'use client';
import { getPayments, getPatients, getCompanies, getPaymentTypes, getPaymentMethods } from '@/lib/actions';
import { PageHeader } from '@/components/shared/page-header';
import DirectPayments from '@/components/admin/finance/direct-payments';
import { useAuth } from '@/components/layout/auth-provider';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldBan } from 'lucide-react';
import React from 'react';

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

type PageData = {
    initialPayments: Awaited<ReturnType<typeof getPayments>>;
    patients: Awaited<ReturnType<typeof getPatients>>;
    companies: Awaited<ReturnType<typeof getCompanies>>;
    paymentTypes: Awaited<ReturnType<typeof getPaymentTypes>>;
    paymentMethods: Awaited<ReturnType<typeof getPaymentMethods>>;
};


export default function DirectPaymentsPage() {
  const { can, currentUser } = useAuth();
  const [data, setData] = React.useState<PageData | null>(null);

  const canAccess = can('admin:all') || can('finance:write') || currentUser?.role === 'patient';

  React.useEffect(() => {
    if (canAccess) {
        Promise.all([
            getPayments(),
            getPatients(),
            getCompanies(),
            getPaymentTypes(),
            getPaymentMethods(),
        ]).then(([initialPayments, patients, companies, paymentTypes, paymentMethods]) => {
            let filteredPayments = initialPayments;
            // If user is patient, filter their payments only
            if (currentUser?.role === 'patient') {
                filteredPayments = initialPayments.filter(p => p.entityId === currentUser.patientId);
            }
            setData({ initialPayments: filteredPayments, patients, companies, paymentTypes, paymentMethods });
        });
    }
  }, [canAccess, currentUser]);

  if (!canAccess) {
    return <DeniedAccess />;
  }

  if (!data) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Pagos Directos" />
      <DirectPayments />
    </div>
  );
}
