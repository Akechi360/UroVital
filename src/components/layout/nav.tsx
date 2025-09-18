'use client';

import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  LayoutGrid,
  Users,
  Calendar,
  Settings,
  Stethoscope,
  PanelLeft,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { href: '/dashboard', label: 'Panel', icon: LayoutGrid },
  { href: '/patients', label: 'Pacientes', icon: Users },
  { href: '/appointments', label: 'Citas', icon: Calendar },
  { href: '/settings', label: 'Configuración', icon: Settings },
];

export default function Nav() {
  const pathname = usePathname();

  // A simple way to check for an exact match or if the path starts with the href
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
            <span className="font-headline">UroMedik</span>
          </Link>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden">
             <PanelLeft />
          </SidebarTrigger>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
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
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        {/* Can add footer content here */}
      </SidebarFooter>
    </>
  );
}
