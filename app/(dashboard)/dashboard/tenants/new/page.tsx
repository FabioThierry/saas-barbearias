import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TenantForm } from "./tenant-form";

export default async function NewTenantPage() {
  await requireRole([UserRole.SuperAdmin]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Create Tenant</h2>
        <p className="text-muted-foreground">
          Add a new barbershop to the system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Information</CardTitle>
          <CardDescription>
            Enter the details for the new barbershop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TenantForm />
        </CardContent>
      </Card>
    </div>
  );
}
