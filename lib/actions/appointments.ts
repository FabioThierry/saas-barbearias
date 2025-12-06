"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import {
  createAppointment,
  updateAppointmentStatus,
  confirmAppointment,
  cancelAppointment,
  rescheduleAppointment,
} from "@/lib/services/appointments";
import { getServiceById } from "@/lib/services/services";
import { getBarberById } from "@/lib/services/barbers";
import { UserRole } from "@/lib/user-roles";
import { z } from "zod";

const bookingSchema = z.object({
  serviceId: z.string().min(1, "Please select a service"),
  barberId: z.string().min(1, "Please select a barber"),
  scheduledDate: z.string().min(1, "Please select a date and time"),
});

export interface AppointmentFormState {
  success?: boolean;
  message?: string;
  errors?: {
    serviceId?: string[];
    barberId?: string[];
    scheduledDate?: string[];
  };
}

export async function createAppointmentAction(
  prevState: AppointmentFormState,
  formData: FormData
): Promise<AppointmentFormState> {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      message: "You must be logged in to book an appointment",
    };
  }

  if (!session.user.tenantId) {
    return {
      success: false,
      message: "You are not associated with any barbershop",
    };
  }

  const rawData = {
    serviceId: formData.get("serviceId") as string,
    barberId: formData.get("barberId") as string,
    scheduledDate: formData.get("scheduledDate") as string,
  };

  const validationResult = bookingSchema.safeParse(rawData);
  if (!validationResult.success) {
    const fieldErrors = validationResult.error.flatten().fieldErrors;
    return {
      success: false,
      errors: {
        serviceId: fieldErrors.serviceId,
        barberId: fieldErrors.barberId,
        scheduledDate: fieldErrors.scheduledDate,
      },
    };
  }

  const {
    serviceId,
    barberId,
    scheduledDate: scheduledDateStr,
  } = validationResult.data;

  try {
    const service = await getServiceById(serviceId);
    if (!service) {
      return { success: false, message: "Selected service not found" };
    }

    if (service.tenantId !== session.user.tenantId) {
      return { success: false, message: "Invalid service selection" };
    }

    const barber = await getBarberById(barberId);
    if (!barber) {
      return { success: false, message: "Selected barber not found" };
    }

    if (barber.tenantId !== session.user.tenantId) {
      return { success: false, message: "Invalid barber selection" };
    }

    if (service.tenantId !== barber.tenantId) {
      return {
        success: false,
        message: "Invalid service and barber combination",
      };
    }

    const scheduledDate = new Date(scheduledDateStr);
    if (isNaN(scheduledDate.getTime())) {
      return {
        success: false,
        errors: { scheduledDate: ["Invalid date and time format"] },
      };
    }

    const now = new Date();
    if (scheduledDate < now) {
      return {
        success: false,
        errors: { scheduledDate: ["Cannot book appointments in the past"] },
      };
    }

    await createAppointment({
      serviceId,
      barberId,
      customerId: session.user.id,
      tenantId: session.user.tenantId,
      scheduledDate,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/appointments");
    revalidatePath("/dashboard/book");

    return { success: true, message: "Appointment booked successfully!" };
  } catch (error) {
    console.error("Error creating appointment:", error);
    return {
      success: false,
      message: "Failed to book appointment. Please try again.",
    };
  }
}

export async function cancelAppointmentAction(
  appointmentId: string
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await cancelAppointment(appointmentId);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/appointments");
    return { success: true, message: "Appointment cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return { success: false, message: "Failed to cancel appointment" };
  }
}

export async function confirmAppointmentAction(
  appointmentId: string
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    await confirmAppointment(appointmentId);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/appointments");
    return { success: true, message: "Appointment confirmed successfully" };
  } catch (error) {
    console.error("Error confirming appointment:", error);
    return { success: false, message: "Failed to confirm appointment" };
  }
}

export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: string
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  if (
    session.user.role !== UserRole.Admin &&
    session.user.role !== UserRole.SuperAdmin &&
    session.user.role !== UserRole.Barber
  ) {
    return {
      success: false,
      message: "You don't have permission to update appointments",
    };
  }

  try {
    await updateAppointmentStatus(appointmentId, status);
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/appointments");
    return { success: true, message: "Appointment status updated" };
  } catch (error) {
    console.error("Error updating appointment:", error);
    return { success: false, message: "Failed to update appointment" };
  }
}

export async function rescheduleAppointmentAction(
  appointmentId: string,
  newScheduledDate: string
): Promise<{ success: boolean; message: string }> {
  const session = await getSession();
  if (!session) {
    return { success: false, message: "Unauthorized" };
  }

  try {
    // Validate the new date
    const newDate = new Date(newScheduledDate);
    if (isNaN(newDate.getTime())) {
      return { success: false, message: "Invalid date format" };
    }

    const now = new Date();
    if (newDate < now) {
      return { success: false, message: "Cannot reschedule to a past date" };
    }

    // Update the appointment with the new date
    await rescheduleAppointment(appointmentId, newDate);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/appointments");
    return { success: true, message: "Appointment rescheduled successfully" };
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    return { success: false, message: "Failed to reschedule appointment" };
  }
}
