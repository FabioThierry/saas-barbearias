import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserRole } from "@/lib/user-roles";
import {
  Building2,
  Users,
  Scissors,
  Calendar,
  Clock,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import { getGlobalStats, getTenantStats } from "@/lib/services/tenants";
import { getServiceCount } from "@/lib/services/services";
import {
  getTodayAppointments,
  getWeekAppointments,
} from "@/lib/services/appointments";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
}: StatCardProps) {
  const content = (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

async function SuperAdminDashboard() {
  const stats = await getGlobalStats();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Super Admin Dashboard
        </h2>
        <p className="text-muted-foreground">
          Manage all tenants and system-wide settings
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Tenants"
          value={stats.tenantCount}
          description="Active barbershops"
          icon={Building2}
          href="/dashboard/tenants"
        />
        <StatCard
          title="Total Users"
          value={stats.userCount}
          description="All registered users"
          icon={Users}
          href="/dashboard/users"
        />
        <StatCard
          title="Total Appointments"
          value={stats.appointmentCount}
          description="All time appointments"
          icon={Calendar}
          href="/dashboard/appointments"
        />
        <StatCard
          title="Active Services"
          value={stats.serviceCount}
          description="Services across all tenants"
          icon={Scissors}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/dashboard/tenants/new"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Building2 className="h-4 w-4" />
              <span>Create New Tenant</span>
            </Link>
            <Link
              href="/dashboard/users/new"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Create New Admin</span>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">All systems operational</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function AdminDashboard({ tenantId }: { tenantId: string }) {
  const [stats, serviceCount, todayCount, weekCount] = await Promise.all([
    getTenantStats(tenantId),
    getServiceCount(tenantId),
    getTodayAppointments(tenantId),
    getWeekAppointments(tenantId),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Barbershop Dashboard
        </h2>
        <p className="text-muted-foreground">
          Manage your barbershop, services, and appointments
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Appointments"
          value={todayCount}
          description="Scheduled for today"
          icon={Calendar}
          href="/dashboard/appointments"
        />
        <StatCard
          title="Barbers"
          value={stats.barberCount}
          description="Active team members"
          icon={Users}
          href="/dashboard/barbers"
        />
        <StatCard
          title="Services"
          value={serviceCount}
          description="Available services"
          icon={Scissors}
          href="/dashboard/services"
        />
        <StatCard
          title="This Week"
          value={weekCount}
          description="Appointments this week"
          icon={Clock}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/dashboard/barbers/new"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Users className="h-4 w-4" />
              <span>Add New Barber</span>
            </Link>
            <Link
              href="/dashboard/services/new"
              className="flex items-center gap-2 rounded-lg border p-3 hover:bg-accent transition-colors"
            >
              <Scissors className="h-4 w-4" />
              <span>Add New Service</span>
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest appointments and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BarberDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Schedule</h2>
        <p className="text-muted-foreground">
          View and manage your appointments
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Today's Appointments"
          value={0}
          description="Scheduled for today"
          icon={Calendar}
          href="/dashboard/schedule"
        />
        <StatCard
          title="This Week"
          value={0}
          description="Upcoming appointments"
          icon={Clock}
        />
        <StatCard
          title="Completed"
          value={0}
          description="This month"
          icon={ClipboardList}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Today`&apos;`s Schedule</CardTitle>
          <CardDescription>Your appointments for today</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No appointments scheduled for today
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomerDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Appointments</h2>
        <p className="text-muted-foreground">
          Book and manage your appointments
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Upcoming"
          value={0}
          description="Scheduled appointments"
          icon={Calendar}
          href="/dashboard/appointments"
        />
        <StatCard
          title="Completed"
          value={0}
          description="Past appointments"
          icon={ClipboardList}
        />
        <Link href="/dashboard/book" className="block">
          <Card className="hover:shadow-md transition-shadow h-full flex flex-col justify-center items-center p-6 bg-primary text-primary-foreground">
            <Calendar className="h-8 w-8 mb-2" />
            <span className="font-semibold">Book New Appointment</span>
          </Card>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>Your scheduled appointments</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No upcoming appointments
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  switch (user.role) {
    case UserRole.SuperAdmin:
      return <SuperAdminDashboard />;
    case UserRole.Admin:
      if (!user.tenantId) {
        return <div>No tenant assigned</div>;
      }
      return <AdminDashboard tenantId={user.tenantId} />;
    case UserRole.Barber:
      return <BarberDashboard />;
    case UserRole.Customer:
      return <CustomerDashboard />;
    default:
      return <CustomerDashboard />;
  }
}
