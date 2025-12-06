import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";
import { getServicesByTenant } from "@/lib/services/services";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scissors, Plus, Clock, DollarSign } from "lucide-react";
import Link from "next/link";
import { DeleteServiceButton } from "./delete-service-button";

export default async function ServicesPage() {
  const session = await requireRole([UserRole.Admin]);
  
  if (!session.user.tenantId) {
    return <div>No tenant assigned</div>;
  }

  const services = await getServicesByTenant(session.user.tenantId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Services</h2>
          <p className="text-muted-foreground">
            Manage your barbershop services
          </p>
        </div>
        <Link href="/dashboard/services/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Service
          </Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Scissors className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No services yet</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first service.</p>
            <Link href="/dashboard/services/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  {service.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${service.price}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/services/${service.id}/edit`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">Edit</Button>
                  </Link>
                  <DeleteServiceButton serviceId={service.id} serviceName={service.name} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
