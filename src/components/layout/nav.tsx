
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
  useSidebar
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
  Handshake,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from './auth-provider';
import { AnimatePresence, motion } from 'framer-motion';

const mainMenuItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutGrid, permission: 'dashboard:read' },
  { href: '/patients', label: 'Pacientes', icon: Users, permission: 'patients:read' },
  { href: '/companies', label: 'Empresas', icon: Building, permission: 'companies:read' },
  { href: '/appointments', label: 'Citas', icon: Calendar, permission: 'appointments:read' },
  { href: '/finanzas', label: 'Finanzas', icon: CreditCard, permission: 'finance:read' },
  { href: '/afiliaciones', label: 'Afiliaciones', icon: Handshake, permission: 'finance:read' },
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
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

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
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Stethoscope className="h-7 w-7 text-primary" />
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.span 
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-headline overflow-hidden whitespace-nowrap"
                    >
                        UroVital
                    </motion.span>
                )}
            </AnimatePresence>
          </Link>
          {!isCollapsed && <SidebarTrigger>
             <PanelLeft />
          </SidebarTrigger>}
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
                   {!isCollapsed && <span>{item.label}</span>}
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
                    {!isCollapsed && <span>Administrativo</span>}
                    {!isCollapsed && <ChevronDown className={`ml-auto h-5 w-5 transition-transform ${isAdminOpen ? 'rotate-180' : ''}`} />}
                </SidebarMenuButton>
                {!isCollapsed && isAdminOpen && (
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
                  {!isCollapsed && <span>{settingsMenuItem.label}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        {/* Can add footer content here */}
      </SidebarFooter>
    </>
  );
}
