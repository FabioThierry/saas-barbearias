import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ServiceForm } from "./service-form";

export default async function NewServicePage() {
  await requireRole([UserRole.Admin]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Add Service</h2>
        <p className="text-muted-foreground">
          Create a new service for your barbershop
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
          <CardDescription>
            Enter the details for the new service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceForm />
        </CardContent>
      </Card>
    </div>
  );
}
