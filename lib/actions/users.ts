"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createUser, getUserByEmail, banUser, unbanUser, deleteUser } from "@/lib/services/users";
import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([UserRole.Admin, UserRole.Barber, UserRole.Customer]),
  tenantId: z.string().nullable(),
});

export type UserFormState = {
  success?: boolean;
  message?: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    role?: string[];
    tenantId?: string[];
  };
};

export async function createUserAction(
  prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const session = await requireRole([UserRole.SuperAdmin, UserRole.Admin]);
  const isSuperAdmin = session.user.role === UserRole.SuperAdmin;

  const role = formData.get("role") as string;
  let tenantId = formData.get("tenantId") as string | null;

  if (!isSuperAdmin) {
    tenantId = session.user.tenantId;
    if (role === UserRole.Admin) {
      return { message: "Only Super Admins can create Admin users." };
    }
  }

  if (role === UserRole.Admin && !tenantId) {
    return { message: "Admin users must be assigned to a tenant." };
  }

  const validatedFields = userSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: role,
    tenantId: tenantId || null,
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please fix the errors below.",
    };
  }

  const existingUser = await getUserByEmail(validatedFields.data.email);
  if (existingUser) {
    return { message: "A user with this email already exists." };
  }

  try {
    await createUser(validatedFields.data);
    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard/barbers");
    return { success: true, message: "User created successfully." };
  } catch (error) {
    return { message: "Failed to create user." };
  }
}

export async function banUserAction(
  id: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  await requireRole([UserRole.SuperAdmin, UserRole.Admin]);

  try {
    await banUser(id, reason);
    revalidatePath("/dashboard/users");
    return { success: true, message: "User banned successfully." };
  } catch (error) {
    return { success: false, message: "Failed to ban user." };
  }
}

export async function unbanUserAction(
  id: string
): Promise<{ success: boolean; message: string }> {
  await requireRole([UserRole.SuperAdmin, UserRole.Admin]);

  try {
    await unbanUser(id);
    revalidatePath("/dashboard/users");
    return { success: true, message: "User unbanned successfully." };
  } catch (error) {
    return { success: false, message: "Failed to unban user." };
  }
}

export async function deleteUserAction(
  id: string
): Promise<{ success: boolean; message: string }> {
  await requireRole([UserRole.SuperAdmin]);

  try {
    await deleteUser(id);
    revalidatePath("/dashboard/users");
    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    return { success: false, message: "Failed to delete user." };
  }
}
