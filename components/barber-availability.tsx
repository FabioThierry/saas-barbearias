"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import { format, addDays, isSameDay, parseISO } from "date-fns";

interface TimeSlot {
  id: string;
  day: string; // e.g., "monday", "tuesday"
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "17:00"
  date?: Date; // For specific date availability
}

interface BarberAvailabilityProps {
  initialTimeSlots: TimeSlot[];
  onSave?: (timeSlots: TimeSlot[]) => void;
}

export function BarberAvailability({
  initialTimeSlots,
  onSave,
}: BarberAvailabilityProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(initialTimeSlots);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");

  const daysOfWeek = [
    { id: "monday", name: "Monday" },
    { id: "tuesday", name: "Tuesday" },
    { id: "wednesday", name: "Wednesday" },
    { id: "thursday", name: "Thursday" },
    { id: "friday", name: "Friday" },
    { id: "saturday", name: "Saturday" },
    { id: "sunday", name: "Sunday" },
  ];

  const addTimeSlot = () => {
    if (!selectedDay) return;

    const newSlot: TimeSlot = {
      id: `slot-${Date.now()}`,
      day: selectedDay,
      startTime,
      endTime,
    };

    setTimeSlots([...timeSlots, newSlot]);
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
  };

  const saveAvailability = () => {
    onSave?.(timeSlots);
  };

  const getSlotsForDay = (day: string) => {
    return timeSlots.filter((slot) => slot.day === day);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Availability Management
        </CardTitle>
        <CardDescription>
          Set your working hours and availability
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-3">Add New Time Slot</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Day of Week
                </label>
                <select
                  value={selectedDay || ""}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <Button onClick={addTimeSlot} disabled={!selectedDay}>
                <Plus className="h-4 w-4 mr-2" />
                Add Time Slot
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Current Availability</h3>
            <div className="space-y-4">
              {daysOfWeek.map((day) => {
                const daySlots = getSlotsForDay(day.id);
                return (
                  <div key={day.id} className="border rounded-lg p-3">
                    <div className="font-medium">{day.name}</div>
                    {daySlots.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            className="flex justify-between items-center p-2 bg-muted rounded"
                          >
                            <span>
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeTimeSlot(slot.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic">
                        No hours set
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={saveAvailability}>Save Availability</Button>
        </div>
      </CardContent>
    </Card>
  );
}
