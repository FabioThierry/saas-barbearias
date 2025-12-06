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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  UserCheck,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

interface AppointmentStatusManagerProps {
  appointment: AppointmentWithDetails;
  onStatusChange: (appointmentId: string, newStatus: string) => void;
}

export function AppointmentStatusManager({
  appointment,
  onStatusChange,
}: AppointmentStatusManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState(appointment.status);

  const statusOptions = [
    {
      value: "scheduled",
      label: "Scheduled",
      icon: Clock,
      color: "text-blue-500",
    },
    {
      value: "confirmed",
      label: "Confirmed",
      icon: CheckCircle,
      color: "text-green-500",
    },
    {
      value: "completed",
      label: "Completed",
      icon: UserCheck,
      color: "text-purple-500",
    },
    {
      value: "cancelled",
      label: "Cancelled",
      icon: XCircle,
      color: "text-red-500",
    },
    {
      value: "no-show",
      label: "No Show",
      icon: AlertCircle,
      color: "text-yellow-500",
    },
  ];

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    if (statusOption) {
      const IconComponent = statusOption.icon;
      return <IconComponent className={`h-4 w-4 ${statusOption.color}`} />;
    }
    return <Clock className="h-4 w-4 text-muted-foreground" />;
  };

  const handleStatusUpdate = () => {
    onStatusChange(appointment.id, newStatus);
    setIsEditing(false);
  };

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
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Appointment Status Management
        </CardTitle>
        <CardDescription>Update the status of this appointment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">{appointment.serviceName}</div>
                <div className="text-sm text-muted-foreground">
                  {format(
                    new Date(appointment.scheduledDate),
                    "MMM d, yyyy 'at' h:mm a"
                  )}
                </div>
                <div className="text-sm mt-1">
                  Customer:{" "}
                  <span className="font-medium">
                    {appointment.customerName}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(appointment.status)}
                <Badge variant={getStatusBadgeVariant(appointment.status)}>
                  {appointment.status.charAt(0).toUpperCase() +
                    appointment.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(option.value)}
                        <span>{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button onClick={handleStatusUpdate} className="flex-1">
                  Update Status
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setNewStatus(appointment.status);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Current status:{" "}
                <span className="font-medium">{appointment.status}</span>
              </p>
              <Button onClick={() => setIsEditing(true)} className="w-full">
                Update Status
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
