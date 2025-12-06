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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Scissors } from "lucide-react";
import {
  getAppointmentsByTenant,
  getAppointmentsByBarber,
  getAppointmentsByCustomer,
} from "@/lib/services/appointments";
import { getBarberByUserId } from "@/lib/services/barbers";
import {
  cancelAppointmentAction,
  confirmAppointmentAction,
  updateAppointmentStatusAction,
} from "@/lib/actions/appointments";

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
  barberName: string;
  customerName: string;
  customerEmail: string;
}

async function AppointmentsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;
  let appointments: Appointment[] = [];

  try {
    if (user.role === UserRole.SuperAdmin) {
      // Super admin can see all appointments (this would require a different service function)
      appointments = [];
    } else if (user.role === UserRole.Admin && user.tenantId) {
      appointments = await getAppointmentsByTenant(user.tenantId);
    } else if (user.role === UserRole.Barber) {
      // Get barber profile to find their barberId
      const barberProfile = await getBarberByUserId(user.id);
      if (barberProfile && user.tenantId) {
        appointments = await getAppointmentsByBarber(
          barberProfile.id,
          user.tenantId
        );
      }
    } else if (user.role === UserRole.Customer) {
      appointments = await getAppointmentsByCustomer(user.id);
    }
  } catch (error) {
    console.error("Error fetching appointments:", error);
  }

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
        <h2 className="text-3xl font-bold tracking-tight">Appointments</h2>
        <p className="text-muted-foreground">
          Manage and view all appointments
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment List</CardTitle>
          <CardDescription>
            {user.role === UserRole.Customer
              ? "Your scheduled appointments"
              : "All appointments for this barbershop"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted" />
              <p>No appointments found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Barber</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Scissors className="h-4 w-4" />
                        {appointment.serviceName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.serviceDuration} min
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {appointment.barberName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {appointment.customerName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.customerEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(
                          appointment.scheduledDate
                        ).toLocaleDateString()}
                        <span className="text-muted-foreground">at</span>
                        {new Date(appointment.scheduledDate).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(appointment.status)}
                      >
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.role === UserRole.Customer &&
                          appointment.status === "scheduled" && (
                            <form
                              action={async (formData: FormData) => {
                                "use server";
                                await cancelAppointmentAction(appointment.id);
                              }}
                            >
                              <Button type="submit" variant="outline" size="sm">
                                Cancel
                              </Button>
                            </form>
                          )}
                        {user.role === UserRole.Customer &&
                          appointment.status === "scheduled" && (
                            <form
                              action={async (formData: FormData) => {
                                "use server";
                                await confirmAppointmentAction(appointment.id);
                              }}
                            >
                              <Button type="submit" variant="default" size="sm">
                                Confirm
                              </Button>
                            </form>
                          )}
                        {(user.role === UserRole.Admin ||
                          user.role === UserRole.SuperAdmin ||
                          user.role === UserRole.Barber) && (
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
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AppointmentsPage;
