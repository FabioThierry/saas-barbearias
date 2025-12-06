import { useState } from "react";
import { AppointmentWithDetails } from "@/lib/services/appointments";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, Mail, Phone } from "lucide-react";
import { format } from "date-fns";

interface AppointmentConfirmationWorkflowProps {
  appointment: AppointmentWithDetails;
  onConfirm?: (appointmentId: string) => void;
  onReschedule?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
}

export function AppointmentConfirmationWorkflow({
  appointment,
  onConfirm,
  onReschedule,
  onCancel,
}: AppointmentConfirmationWorkflowProps) {
  const [step, setStep] = useState(1); // 1: Confirmation, 2: Confirmed, 3: Cancellation

  const handleConfirm = () => {
    onConfirm?.(appointment.id);
    setStep(2);
  };

  const handleCancel = () => {
    onCancel?.(appointment.id);
    setStep(3);
  };

  const handleReschedule = () => {
    onReschedule?.(appointment.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {appointment.status === "confirmed" ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : appointment.status === "cancelled" ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <Clock className="h-5 w-5 text-yellow-500" />
          )}
          Appointment Confirmation
        </CardTitle>
        <CardDescription>
          Confirm, reschedule, or cancel your appointment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="font-medium">{appointment.serviceName}</div>
            <div className="text-sm text-muted-foreground">
              {format(
                new Date(appointment.scheduledDate),
                "EEEE, MMMM d, yyyy 'at' h:mm a"
              )}
            </div>
            <div className="text-sm mt-1">
              With <span className="font-medium">{appointment.barberName}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {appointment.customerName} ({appointment.customerEmail})
            </div>
          </div>

          {step === 1 && appointment.status === "scheduled" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="text-sm">
                  Confirmation email will be sent upon confirmation
                </span>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={handleConfirm}
                  className="flex-1 min-w-[120px]"
                >
                  Confirm Appointment
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReschedule}
                  className="flex-1 min-w-[120px]"
                >
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 min-w-[120px]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Appointment Confirmed!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your appointment has been confirmed. A confirmation email has
                been sent to {appointment.customerEmail}.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setStep(1)}>Back</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium">Appointment Cancelled</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your appointment has been cancelled. A cancellation email has
                been sent to {appointment.customerEmail}.
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setStep(1)}>Back</Button>
              </div>
            </div>
          )}

          {appointment.status === "confirmed" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Appointment Confirmed</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This appointment has already been confirmed.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReschedule}>
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="text-red-600 hover:text-red-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {appointment.status === "cancelled" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium">Appointment Cancelled</span>
              </div>
              <p className="text-sm text-muted-foreground">
                This appointment has been cancelled.
              </p>
              <Button onClick={handleReschedule}>Book New Appointment</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
