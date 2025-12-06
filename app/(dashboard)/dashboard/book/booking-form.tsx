"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useActionState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createAppointmentAction, AppointmentFormState } from "@/lib/actions/appointments";
import { toast } from "sonner";
import { CalendarIcon, Clock, Loader2, Scissors, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: string;
}

interface Barber {
  id: string;
  name: string;
}

interface BookingFormProps {
  services: Service[];
  barbers: Barber[];
}

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  barberId: z.string().min(1, "Please select a barber"),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string().min(1, "Please select a time"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

const initialState: AppointmentFormState = {};

export function BookingForm({ services, barbers }: BookingFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createAppointmentAction, initialState);

  const {
    setValue,
    watch,
    formState: { errors },
    setError,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceId: "",
      barberId: "",
      time: "",
    },
  });

  const selectedService = watch("serviceId");
  const selectedBarber = watch("barberId");
  const selectedDate = watch("date");
  const selectedTime = watch("time");

  const selectedServiceData = services.find((s) => s.id === selectedService);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      router.push("/dashboard");
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
    if (state.errors?.serviceId) {
      setError("serviceId", { message: state.errors.serviceId[0] });
    }
    if (state.errors?.barberId) {
      setError("barberId", { message: state.errors.barberId[0] });
    }
    if (state.errors?.scheduledDate) {
      setError("date", { message: state.errors.scheduledDate[0] });
    }
  }, [state, router, setError]);

  const isFormValid = selectedService && selectedBarber && selectedDate && selectedTime;

  const getScheduledDateISO = () => {
    if (selectedDate && selectedTime) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const scheduledDate = new Date(`${dateStr}T${selectedTime}:00`);
      return scheduledDate.toISOString();
    }
    return "";
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="serviceId" value={selectedService} />
      <input type="hidden" name="barberId" value={selectedBarber} />
      <input type="hidden" name="scheduledDate" value={getScheduledDateISO()} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5" />
              Select Service
            </CardTitle>
            <CardDescription>Choose the service you want</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedService}
              onValueChange={(value) => setValue("serviceId", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex flex-col items-start">
                      <span>{service.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {service.duration} min - ${service.price}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.serviceId && (
              <p className="text-sm text-destructive">{errors.serviceId.message}</p>
            )}

            {selectedServiceData && (
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium">{selectedServiceData.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Duration: {selectedServiceData.duration} minutes
                </p>
                <p className="text-sm font-medium mt-1">
                  Price: ${selectedServiceData.price}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Barber
            </CardTitle>
            <CardDescription>Choose your preferred barber</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={selectedBarber}
              onValueChange={(value) => setValue("barberId", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a barber" />
              </SelectTrigger>
              <SelectContent>
                {barbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.barberId && (
              <p className="text-sm text-destructive">{errors.barberId.message}</p>
            )}
            {barbers.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No barbers available for this location
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Select Date & Time
          </CardTitle>
          <CardDescription>When would you like your appointment?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setValue("date", date);
                      }
                    }}
                    disabled={(date) =>
                      date < new Date() || date.getDay() === 0
                    }
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <Select
                value={selectedTime}
                onValueChange={(value) => setValue("time", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a time">
                    {selectedTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {selectedTime}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem key={time} value={time}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {time}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isFormValid && selectedServiceData && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service:</span>
                <span className="font-medium">{selectedServiceData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Barber:</span>
                <span className="font-medium">
                  {barbers.find((b) => b.id === selectedBarber)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{format(selectedDate!, "PPP")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{selectedServiceData.duration} minutes</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-medium">Total:</span>
                <span className="font-bold text-lg">${selectedServiceData.price}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending || !isFormValid} className="flex-1">
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Book Appointment
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
