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
import { useAuth } from './auth-provider';

const mainMenuItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutGrid, permission: 'dashboard:read' },
  { href: '/patients', label: 'Pacientes', icon: Users, permission: 'patients:read' },
  { href: '/companies', label: 'Empresas', icon: Building, permission: 'companies:read' },
  { href: '/appointments', label: 'Citas', icon: Calendar, permission: 'appointments:read' },
  { href: '/finanzas', label: 'Finanzas', icon: CreditCard, permission: 'finance:read' },
  { href: '/afiliaciones', label: 'Afiliaciones', icon: Users, permission: 'finance:read' },
];

const adminMenuItems = [
    { href: '/administrativo/supplies', label: 'Suministros', icon: Box, permission: 'admin:all' },
    { href: '/administrativo/providers', label: 'Proveedores', icon: Truck, permission: 'admin:all' },
    { href: '/administrativo/alerts', label: 'Alertas', icon: Bell, permission: 'admin:all' },
]

const settingsMenuItem = { href: '/settings', label: 'Configuración', icon: Settings, permission: 'settings:read' };

export default function Nav() {
  const pathname = usePathname();
  const { can } = useAuth();
  const [isAdminOpen, setIsAdminOpen] = useState(pathname.startsWith('/administrativo'));

  const isActive = (href: string) => {
    if (href === '/dashboard') {
        return pathname === href;
    }
    return pathname.startsWith(href);
  }
  
  const canViewAdmin = adminMenuItems.some(item => can(item.permission as any));

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg group-data-[collapsible=icon]:hidden">
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
             can(item.permission as any) &&
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
            
            {canViewAdmin && (
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
                             can(item.permission as any) &&
                            <SidebarMenuSubItem key={item.href}>
                                <SidebarMenuSubButton asChild isActive={pathname === item.href}>
                                    <Link href={item.href}>
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                )}
            </SidebarMenuItem>
            )}

          {can(settingsMenuItem.permission as any) && <SidebarMenuItem>
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
            </SidebarMenuItem>}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        {/* Can add footer content here */}
      </SidebarFooter>
    </>
  );
}
