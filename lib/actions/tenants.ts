"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createTenant, updateTenant, deleteTenant } from "@/lib/services/tenants";
import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";

const tenantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  domain: z.string().min(3, "Domain must be at least 3 characters").max(255).regex(/^[a-z0-9-]+$/, "Domain can only contain lowercase letters, numbers, and hyphens"),
});

export type TenantFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    domain?: string[];
  };
};

export async function createTenantAction(
  prevState: TenantFormState,
  formData: FormData
): Promise<TenantFormState> {
  await requireRole([UserRole.SuperAdmin]);

  const validatedFields = tenantSchema.safeParse({
    name: formData.get("name"),
    domain: formData.get("domain"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    await createTenant(validatedFields.data);
    revalidatePath("/dashboard/tenants");
    return { success: true, message: "Tenant created successfully." };
  } catch (error) {
    return { message: "Failed to create tenant. The domain might already exist." };
  }
}

export async function updateTenantAction(
  id: string,
  prevState: TenantFormState,
  formData: FormData
): Promise<TenantFormState> {
  await requireRole([UserRole.SuperAdmin]);

  const validatedFields = tenantSchema.safeParse({
    name: formData.get("name"),
    domain: formData.get("domain"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  try {
    const result = await updateTenant(id, validatedFields.data);
    if (!result) {
      return { message: "Tenant not found." };
    }
    revalidatePath("/dashboard/tenants");
    return { success: true, message: "Tenant updated successfully." };
  } catch (error) {
    return { message: "Failed to update tenant." };
  }
}

export async function deleteTenantAction(id: string): Promise<{ success: boolean; message: string }> {
  await requireRole([UserRole.SuperAdmin]);

  try {
    await deleteTenant(id);
    revalidatePath("/dashboard/tenants");
    return { success: true, message: "Tenant deleted successfully." };
  } catch (error) {
    return { success: false, message: "Failed to delete tenant." };
  }
}
