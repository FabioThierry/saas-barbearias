"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createService, updateService, deleteService, getServiceById } from "@/lib/services/services";
import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";

const serviceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  duration: z.coerce.number().min(5, "Duration must be at least 5 minutes").max(480, "Duration cannot exceed 8 hours"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
});

export type ServiceFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    duration?: string[];
    price?: string[];
  };
};

export async function createServiceAction(
  prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const session = await requireRole([UserRole.Admin]);
  
  if (!session.user.tenantId) {
    return { message: "No tenant assigned to your account." };
  }

  const validatedFields = serviceSchema.safeParse({
    name: formData.get("name"),
    duration: formData.get("duration"),
    price: formData.get("price"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    await createService({
      ...validatedFields.data,
      tenantId: session.user.tenantId,
    });
    revalidatePath("/dashboard/services");
    return { success: true, message: "Service created successfully." };
  } catch (error) {
    return { message: "Failed to create service." };
  }
}

export async function updateServiceAction(
  id: string,
  prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  const session = await requireRole([UserRole.Admin]);

  const service = await getServiceById(id);
  if (!service || service.tenantId !== session.user.tenantId) {
    return { message: "Service not found." };
  }

  const validatedFields = serviceSchema.safeParse({
    name: formData.get("name"),
    duration: formData.get("duration"),
    price: formData.get("price"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    await updateService(id, validatedFields.data);
    revalidatePath("/dashboard/services");
    return { success: true, message: "Service updated successfully." };
  } catch (error) {
    return { message: "Failed to update service." };
  }
}

export async function deleteServiceAction(id: string): Promise<{ success: boolean; message: string }> {
  const session = await requireRole([UserRole.Admin]);

  const service = await getServiceById(id);
  if (!service || service.tenantId !== session.user.tenantId) {
    return { success: false, message: "Service not found." };
  }

  try {
    await deleteService(id);
    revalidatePath("/dashboard/services");
    return { success: true, message: "Service deleted successfully." };
  } catch (error) {
    return { success: false, message: "Failed to delete service. It may be linked to appointments." };
  }
}
