'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  LayoutGrid,
  Users,
  Calendar,
  Settings,
  Stethoscope,
  PanelLeft,
  Building,
  Box,
  Truck,
  Bell,
  ChevronDown,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const mainMenuItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutGrid },
  { href: '/patients', label: 'Pacientes', icon: Users },
  { href: '/companies', label: 'Empresas', icon: Building },
  { href: '/appointments', label: 'Citas', icon: Calendar },
];

const adminMenuItems = [
    { href: '/administrativo/supplies', label: 'Suministros', icon: Box },
    { href: '/administrativo/providers', label: 'Proveedores', icon: Truck },
    { href: '/administrativo/alerts', label: 'Alertas', icon: Bell },
]

const financeMenuItems = [
    { href: '/administrativo/finanzas/metodos', label: 'Métodos de Pago' },
    { href: '/administrativo/finanzas/tipos', label: 'Tipos de Pago' },
    { href: '/administrativo/finanzas/pagos', label: 'Pagos Directos' },
    { href: '/administrativo/finanzas/facturacion', label: 'Facturación' },
]

const settingsMenuItem = { href: '/settings', label: 'Configuración', icon: Settings };

export default function Nav() {
  const pathname = usePathname();
  const [isAdminOpen, setIsAdminOpen] = useState(pathname.startsWith('/administrativo'));
  const [isFinanceOpen, setIsFinanceOpen] = useState(pathname.startsWith('/administrativo/finanzas'));

  const isActive = (href: string) => {
    if (href === '/dashboard') {
        return pathname === href;
    }
    return pathname.startsWith(href);
  }

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg group-data-[collapsible=icon]:hidden">
            <Stethoscope className="h-7 w-7 text-primary" />
            <span className="font-headline">UroVital</span>
          </Link>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden">
             <PanelLeft />
          </SidebarTrigger>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.href)}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
            
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => setIsAdminOpen(!isAdminOpen)}
                    isActive={isActive('/administrativo')}
                    tooltip={{ children: 'Administrativo' }}
                >
                    <Box />
                    <span>Administrativo</span>
                    <ChevronDown className={`ml-auto h-5 w-5 transition-transform ${isAdminOpen ? 'rotate-180' : ''}`} />
                </SidebarMenuButton>
                {isAdminOpen && (
                    <SidebarMenuSub>
                        {adminMenuItems.map(item => (
                            <SidebarMenuSubItem key={item.href}>
                                <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                                    <Link href={item.href}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                                onClick={() => setIsFinanceOpen(!isFinanceOpen)}
                                isActive={isActive('/administrativo/finanzas')}
                            >
                                <CreditCard />
                                <span>Finanzas</span>
                                 <ChevronDown className={`ml-auto h-5 w-5 transition-transform ${isFinanceOpen ? 'rotate-180' : ''}`} />
                            </SidebarMenuSubButton>
                            {isFinanceOpen && (
                                <SidebarMenuSub>
                                    {financeMenuItems.map(item => (
                                        <SidebarMenuSubItem key={item.href}>
                                            <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                                                <Link href={item.href}>
                                                    <span>{item.label}</span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    ))}
                                </SidebarMenuSub>
                            )}
                        </SidebarMenuSubItem>
                    </SidebarMenuSub>
                )}
            </SidebarMenuItem>

          <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={isActive(settingsMenuItem.href)}
                tooltip={{ children: settingsMenuItem.label }}
              >
                <Link href={settingsMenuItem.href}>
                  <settingsMenuItem.icon />
                  <span>{settingsMenuItem.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        {/* Can add footer content here */}
      </SidebarFooter>
    </>
  );
}