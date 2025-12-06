import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";
import { getAllTenants, getTenantStats } from "@/lib/services/tenants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Users, Scissors, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

async function TenantCard({ tenant }: { tenant: { id: string; name: string; domain: string; createdAt: Date } }) {
  const stats = await getTenantStats(tenant.id);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          {tenant.name}
        </CardTitle>
        <CardDescription>{tenant.domain}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{stats.userCount} users</span>
          </div>
          <div className="flex items-center gap-1">
            <Scissors className="h-4 w-4 text-muted-foreground" />
            <span>{stats.serviceCount} services</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{stats.appointmentCount} appts</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            Created {format(tenant.createdAt, "MMM d, yyyy")}
          </span>
          <Link href={`/dashboard/tenants/${tenant.id}`}>
            <Button variant="outline" size="sm">View Details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function TenantsPage() {
  await requireRole([UserRole.SuperAdmin]);

  const tenants = await getAllTenants();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">
            Manage all barbershops in the system
          </p>
        </div>
        <Link href="/dashboard/tenants/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Tenant
          </Button>
        </Link>
      </div>

      {tenants.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tenants yet</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first barbershop.</p>
            <Link href="/dashboard/tenants/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Tenant
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}
    </div>
  );
}
