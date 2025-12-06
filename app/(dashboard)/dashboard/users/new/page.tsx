import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";
import { getAllTenants } from "@/lib/services/tenants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "./user-form";

interface NewUserPageProps {
  searchParams: Promise<{ tenantId?: string }>;
}

export default async function NewUserPage({ searchParams }: NewUserPageProps) {
  const session = await requireRole([UserRole.SuperAdmin, UserRole.Admin]);
  const isSuperAdmin = session.user.role === UserRole.SuperAdmin;

  const tenants = isSuperAdmin ? await getAllTenants() : [];
  const { tenantId } = await searchParams;
  const preselectedTenantId = isSuperAdmin ? (tenantId || null) : session.user.tenantId;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Create User</h2>
        <p className="text-muted-foreground">
          {isSuperAdmin ? "Add a new user to the system" : "Add a new user to your barbershop"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Enter the details for the new user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserForm 
            tenants={tenants} 
            isSuperAdmin={isSuperAdmin} 
            preselectedTenantId={preselectedTenantId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
