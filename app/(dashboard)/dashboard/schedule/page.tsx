import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/user-roles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Scissors, Plus } from "lucide-react";
import { getAppointmentsByBarber } from "@/lib/services/appointments";
import { getBarberByUserId } from "@/lib/services/barbers";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { updateAppointmentStatusAction } from "@/lib/actions/appointments";

interface Appointment {
  id: string;
  serviceId: string;
  barberId: string;
  customerId: string;
  tenantId: string;
  scheduledDate: Date;
  status: string;
  confirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
  serviceName: string;
  serviceDuration: number;
  servicePrice: string;
}

async function SchedulePage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  if (user.role !== UserRole.Barber) {
    redirect("/dashboard");
  }

  let appointments: Appointment[] = [];

  try {
    // Get barber profile to find their barberId
    const barberProfile = await getBarberByUserId(user.id);
    if (barberProfile && user.tenantId) {
      appointments = await getAppointmentsByBarber(
        barberProfile.id,
        user.tenantId
      );
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }

  // Filter appointments for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysAppointments = appointments
    .filter((app) => {
      const appDate = new Date(app.scheduledDate);
      appDate.setHours(0, 0, 0, 0);
      return appDate.getTime() === today.getTime();
    })
    .sort(
      (a, b) =>
        new Date(a.scheduledDate).getTime() -
        new Date(b.scheduledDate).getTime()
    );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "confirmed":
        return "secondary";
      case "completed":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "no-show":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Schedule</h2>
        <p className="text-muted-foreground">
          View and manage your appointments
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Todays Schedule</CardTitle>
            <CardDescription>
              Appointments scheduled for{" "}
              {today.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaysAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-muted" />
                <p>No appointments scheduled for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="border rounded-lg p-4 hover:bg-accent transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {new Date(
                              appointment.scheduledDate
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <Scissors className="h-4 w-4" />
                          <span>{appointment.serviceName}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>Customer</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge
                          variant={getStatusBadgeVariant(appointment.status)}
                        >
                          {appointment.status.charAt(0).toUpperCase() +
                            appointment.status.slice(1)}
                        </Badge>
                        <div className="mt-2 flex gap-2">
                          <form
                            action={async (formData: FormData) => {
                              "use server";
                              await updateAppointmentStatusAction(
                                appointment.id,
                                "completed"
                              );
                            }}
                          >
                            <Button type="submit" variant="outline" size="sm">
                              Complete
                            </Button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
              <CardDescription>
                View your appointments on a calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarComponent className="rounded-md border" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Availability</CardTitle>
              <CardDescription>
                Set your working hours and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Monday - Friday</div>
                    <div className="text-sm text-muted-foreground">
                      9:00 AM - 6:00 PM
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Saturday</div>
                    <div className="text-sm text-muted-foreground">
                      10:00 AM - 4:00 PM
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Sunday</div>
                    <div className="text-sm text-muted-foreground">Closed</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SchedulePage;
