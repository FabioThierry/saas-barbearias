import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarberForm } from "./barber-form";

export default async function NewBarberPage() {
  await requireRole([UserRole.Admin]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Add Barber</h2>
        <p className="text-muted-foreground">
          Add a new barber to your team
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Barber Information</CardTitle>
          <CardDescription>
            Enter the details for the new barber
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BarberForm />
        </CardContent>
      </Card>
    </div>
  );
}
