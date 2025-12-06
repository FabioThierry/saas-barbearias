import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";
import { getTenantById } from "@/lib/services/tenants";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditTenantForm } from "./edit-tenant-form";

interface EditTenantPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTenantPage({ params }: EditTenantPageProps) {
  await requireRole([UserRole.SuperAdmin]);

  const { id } = await params;
  const tenant = await getTenantById(id);

  if (!tenant) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/tenants/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Tenant</h2>
          <p className="text-muted-foreground">Update barbershop information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Information</CardTitle>
          <CardDescription>Edit the details for this barbershop</CardDescription>
        </CardHeader>
        <CardContent>
          <EditTenantForm tenant={tenant} />
        </CardContent>
      </Card>
    </div>
  );
}
