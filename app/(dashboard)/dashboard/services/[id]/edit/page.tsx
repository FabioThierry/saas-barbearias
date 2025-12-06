import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";
import { getServiceById } from "@/lib/services/services";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EditServiceForm } from "./edit-service-form";

interface EditServicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const session = await requireRole([UserRole.Admin]);

  const { id } = await params;
  const service = await getServiceById(id);

  if (!service || service.tenantId !== session.user.tenantId) {
    notFound();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/services">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Service</h2>
          <p className="text-muted-foreground">Update service details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
          <CardDescription>Edit the details for this service</CardDescription>
        </CardHeader>
        <CardContent>
          <EditServiceForm service={service} />
        </CardContent>
      </Card>
    </div>
  );
}
