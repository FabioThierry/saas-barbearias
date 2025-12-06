import { requireSession } from "@/lib/session";
import { getServicesByTenant } from "@/lib/services/services";
import { getBarbersByTenantWithProfile } from "@/lib/services/barbers";
import { BookingForm } from "./booking-form";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarX } from "lucide-react";

export default async function BookAppointmentPage() {
  const session = await requireSession();

  if (!session.user.tenantId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Book Appointment</h2>
          <p className="text-muted-foreground">Schedule your next visit</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarX className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No barbershop assigned</h3>
            <p className="text-muted-foreground">
              You are not associated with any barbershop yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [services, barbers] = await Promise.all([
    getServicesByTenant(session.user.tenantId),
    getBarbersByTenantWithProfile(session.user.tenantId),
  ]);

  if (services.length === 0 || barbers.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Book Appointment</h2>
          <p className="text-muted-foreground">Schedule your next visit</p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CalendarX className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {services.length === 0
                ? "No services available"
                : "No barbers available"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {services.length === 0
                ? "This barbershop hasn't added any services yet. Please check back later."
                : "This barbershop doesn't have any barbers yet. Please check back later."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Book Appointment</h2>
        <p className="text-muted-foreground">
          Choose a service, barber, and time for your appointment
        </p>
      </div>

      <BookingForm
        services={services.map((s) => ({
          id: s.id,
          name: s.name,
          duration: s.duration,
          price: s.price,
        }))}
        barbers={barbers.map((b) => ({
          id: b.id,
          name: b.name,
        }))}
      />
    </div>
  );
}
