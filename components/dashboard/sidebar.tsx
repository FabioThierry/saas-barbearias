"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/user-roles";
import {
  LayoutDashboard,
  Users,
  Building2,
  Scissors,
  Calendar,
  Settings,
  ClipboardList,
  UserCog,
  Clock,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [UserRole.SuperAdmin, UserRole.Admin, UserRole.Barber, UserRole.Customer],
  },
  {
    title: "Tenants",
    href: "/dashboard/tenants",
    icon: Building2,
    roles: [UserRole.SuperAdmin],
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
    roles: [UserRole.SuperAdmin, UserRole.Admin],
  },
  {
    title: "Barbers",
    href: "/dashboard/barbers",
    icon: UserCog,
    roles: [UserRole.Admin],
  },
  {
    title: "Services",
    href: "/dashboard/services",
    icon: Scissors,
    roles: [UserRole.Admin],
  },
  {
    title: "Appointments",
    href: "/dashboard/appointments",
    icon: Calendar,
    roles: [UserRole.SuperAdmin, UserRole.Admin, UserRole.Barber, UserRole.Customer],
  },
  {
    title: "My Schedule",
    href: "/dashboard/schedule",
    icon: Clock,
    roles: [UserRole.Barber],
  },
  {
    title: "Book Appointment",
    href: "/dashboard/book",
    icon: ClipboardList,
    roles: [UserRole.Customer],
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    roles: [UserRole.SuperAdmin, UserRole.Admin],
  },
];

interface SidebarProps {
  userRole: UserRole;
  className?: string;
}

export function Sidebar({ userRole, className }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r bg-sidebar text-sidebar-foreground",
        className
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Scissors className="h-6 w-6" />
          <span className="text-lg">BarberSaaS</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
