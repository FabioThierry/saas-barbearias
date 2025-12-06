"use client";

import { useState } from "react";
import { AppointmentWithDetails } from "@/lib/services/appointments";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Scissors, User } from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isSameMonth,
} from "date-fns";

interface AppointmentCalendarProps {
  appointments: AppointmentWithDetails[];
  onDateSelect?: (date: Date) => void;
  onAppointmentSelect?: (appointment: AppointmentWithDetails) => void;
}

export function AppointmentCalendar({
  appointments,
  onDateSelect,
  onAppointmentSelect,
}: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const appointmentsForDate = (date: Date) => {
    return appointments.filter((app) =>
      isSameDay(new Date(app.scheduledDate), date)
    );
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const nextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const prevWeek = () => {
    setCurrentDate(addDays(currentDate, -7));
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Appointment Calendar</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={prevWeek}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={nextWeek}>
            Next
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div className="text-center text-sm font-medium text-muted-foreground">
            Time
          </div>
          {daysInWeek.map((day, index) => (
            <div
              key={index}
              className={`text-center text-sm font-medium ${
                isSameDay(day, new Date())
                  ? "text-primary bg-primary/10 rounded-md py-1"
                  : "text-muted-foreground"
              }`}
            >
              <div>{format(day, "EEE")}</div>
              <div>{format(day, "MMM d")}</div>
            </div>
          ))}
        </div>

        {/* Time slots - 8am to 8pm */}
        {Array.from({ length: 13 }, (_, i) => {
          const hour = 8 + i; // 8am to 8pm
          const hourAppointments = daysInWeek.map((day) =>
            appointmentsForDate(day).filter((app) => {
              const appDate = new Date(app.scheduledDate);
              return appDate.getHours() === hour;
            })
          );

          return (
            <div key={hour} className="grid grid-cols-8 gap-1">
              <div className="text-xs text-muted-foreground py-2 text-right pr-2">
                {hour > 12
                  ? `${hour - 12} PM`
                  : hour === 12
                  ? "12 PM"
                  : `${hour} AM`}
              </div>
              {hourAppointments.map((dayApps, dayIndex) => {
                const day = daysInWeek[dayIndex];
                return (
                  <div
                    key={dayIndex}
                    className={`min-h-16 p-1 border rounded ${
                      isSameDay(day, selectedDate)
                        ? "bg-blue-50 border-blue-200"
                        : isSameDay(day, new Date())
                        ? "bg-green-50 border-green-200"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleDateSelect(day)}
                  >
                    {dayApps.map((app) => (
                      <div
                        key={app.id}
                        className={`text-xs p-1 mb-1 rounded cursor-pointer hover:opacity-90 ${
                          app.status === "completed"
                            ? "bg-green-100"
                            : app.status === "cancelled"
                            ? "bg-red-100"
                            : app.status === "no-show"
                            ? "bg-yellow-100"
                            : "bg-blue-100"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAppointmentSelect) {
                            onAppointmentSelect(app);
                          }
                        }}
                      >
                        <div className="font-medium truncate">
                          {app.serviceName}
                        </div>
                        <div className="truncate">{app.customerName}</div>
                        <div className="text-[10px]">
                          {format(new Date(app.scheduledDate), "h:mm a")}
                        </div>
                        <Badge
                          variant={getStatusBadgeVariant(app.status)}
                          className="text-[10px] mt-1"
                        >
                          {app.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
