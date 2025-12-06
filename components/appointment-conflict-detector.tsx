import { AppointmentWithDetails } from "@/lib/services/appointments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface AppointmentConflictDetectorProps {
  appointments: AppointmentWithDetails[];
  newAppointment?: {
    barberId: string;
    scheduledDate: Date;
    serviceDuration: number;
  };
}

export function AppointmentConflictDetector({
  appointments,
  newAppointment,
}: AppointmentConflictDetectorProps) {
  // Function to check if two time slots overlap
  const doTimeSlotsOverlap = (
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean => {
    return start1 < end2 && start2 < end1;
  };

  // Find conflicts for a new appointment
  const findConflicts = () => {
    if (!newAppointment) return [];

    const newAppointmentEnd = new Date(
      newAppointment.scheduledDate.getTime() +
        newAppointment.serviceDuration * 60000 // Convert minutes to milliseconds
    );

    return appointments.filter((app) => {
      // Check if same barber
      if (app.barberId !== newAppointment.barberId) return false;

      // Calculate existing appointment end time
      const existingAppointmentEnd = new Date(
        new Date(app.scheduledDate).getTime() + app.serviceDuration * 60000
      );

      // Check if time slots overlap
      return doTimeSlotsOverlap(
        newAppointment.scheduledDate,
        newAppointmentEnd,
        new Date(app.scheduledDate),
        existingAppointmentEnd
      );
    });
  };

  const conflicts = newAppointment ? findConflicts() : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Appointment Conflict Detection
        </CardTitle>
        <CardDescription>
          Check for scheduling conflicts and availability
        </CardDescription>
      </CardHeader>
      <CardContent>
        {newAppointment ? (
          <div>
            {conflicts.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Conflicts Found</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  The new appointment conflicts with {conflicts.length} existing
                  appointment(s):
                </p>
                <div className="space-y-2">
                  {conflicts.map((conflict) => (
                    <div
                      key={conflict.id}
                      className="border-l-4 border-yellow-400 pl-3 py-1"
                    >
                      <div className="font-medium">{conflict.serviceName}</div>
                      <div className="text-sm text-muted-foreground">
                        {conflict.customerName} -{" "}
                        {format(
                          new Date(conflict.scheduledDate),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">No Conflicts</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  The new appointment is available at{" "}
                  {format(
                    newAppointment.scheduledDate,
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Conflict Detection</span>
            </div>
            <p className="text-sm text-muted-foreground">
              This component checks for scheduling conflicts when creating new
              appointments
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
