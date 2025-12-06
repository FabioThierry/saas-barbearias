import { AppointmentWithDetails } from "@/lib/services/appointments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  User,
  Scissors,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import { format } from "date-fns";

interface AppointmentDetailProps {
  appointment: AppointmentWithDetails;
  onStatusChange?: (appointmentId: string, newStatus: string) => void;
  onCancel?: (appointmentId: string) => void;
  onConfirm?: (appointmentId: string) => void;
}

export function AppointmentDetail({
  appointment,
  onStatusChange,
  onCancel,
  onConfirm,
}: AppointmentDetailProps) {
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
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>
              {format(
                new Date(appointment.scheduledDate),
                "EEEE, MMMM d, yyyy 'at' h:mm a"
              )}
            </CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(appointment.status)}>
            {appointment.status.charAt(0).toUpperCase() +
              appointment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Service Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Scissors className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{appointment.serviceName}</div>
                  <div className="text-sm text-muted-foreground">
                    Duration: {appointment.serviceDuration} minutes
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Date & Time</div>
                  <div className="text-sm text-muted-foreground">
                    {format(
                      new Date(appointment.scheduledDate),
                      "EEEE, MMMM d, yyyy 'at' h:mm a"
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Barber</div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.barberName}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Customer Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{appointment.customerName}</div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.customerEmail}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  {appointment.customerEmail}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap pt-4">
          {appointment.status === "scheduled" && (
            <>
              <Button
                onClick={() => onConfirm?.(appointment.id)}
                variant="default"
              >
                Confirm
              </Button>
              <Button
                onClick={() => onCancel?.(appointment.id)}
                variant="outline"
              >
                Cancel
              </Button>
            </>
          )}
          {(appointment.status === "scheduled" ||
            appointment.status === "confirmed") && (
            <Button
              onClick={() => onStatusChange?.(appointment.id, "completed")}
              variant="secondary"
            >
              Mark as Completed
            </Button>
          )}
          {(appointment.status === "scheduled" ||
            appointment.status === "confirmed") && (
            <Button
              onClick={() => onStatusChange?.(appointment.id, "no-show")}
              variant="outline"
            >
              Mark as No-Show
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
