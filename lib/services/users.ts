import { db } from "@/lib/db";
import { user, barbers, account } from "@/lib/db/schema";
import { eq, and, count, isNull } from "drizzle-orm";
import { UserRole } from "@/lib/user-roles";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId: string | null;
  image: string | null;
  banned: boolean | null;
  createdAt: Date;
}

export async function getUsersByTenant(tenantId: string): Promise<UserData[]> {
  return await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      image: user.image,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.tenantId, tenantId))
    .orderBy(user.createdAt);
}

export async function getAllAdmins(): Promise<UserData[]> {
  return await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      image: user.image,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.role, UserRole.Admin))
    .orderBy(user.createdAt);
}

export async function getBarbersByTenant(tenantId: string): Promise<UserData[]> {
  return await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      image: user.image,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(and(eq(user.tenantId, tenantId), eq(user.role, UserRole.Barber)))
    .orderBy(user.createdAt);
}

export async function getCustomersByTenant(
  tenantId: string
): Promise<UserData[]> {
  return await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      image: user.image,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(and(eq(user.tenantId, tenantId), eq(user.role, UserRole.Customer)))
    .orderBy(user.createdAt);
}

export async function getUserById(id: string): Promise<UserData | null> {
  const result = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      image: user.image,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);
  return result[0] || null;
}

export async function updateUserRole(
  id: string,
  role: UserRole
): Promise<boolean> {
  await db.update(user).set({ role }).where(eq(user.id, id));
  return true;
}

export async function banUser(
  id: string,
  reason: string,
  expires?: Date
): Promise<boolean> {
  await db
    .update(user)
    .set({
      banned: true,
      banReason: reason,
      banExpires: expires || null,
    })
    .where(eq(user.id, id));
  return true;
}

export async function unbanUser(id: string): Promise<boolean> {
  await db
    .update(user)
    .set({
      banned: false,
      banReason: null,
      banExpires: null,
    })
    .where(eq(user.id, id));
  return true;
}

export async function getUserCountByRole(
  tenantId: string,
  role: UserRole
): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(user)
    .where(and(eq(user.tenantId, tenantId), eq(user.role, role)));
  return result[0]?.count || 0;
}

export async function getAllUsers(): Promise<UserData[]> {
  return await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      image: user.image,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(user.createdAt);
}

export async function getUserByEmail(email: string): Promise<UserData | null> {
  const result = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      image: user.image,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);
  return result[0] || null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  tenantId: string | null;
}): Promise<UserData> {
  const userId = randomUUID();
  const accountId = randomUUID();
  const now = new Date();
  const hashedPassword = await bcrypt.hash(data.password, 10);

  await db.insert(user).values({
    id: userId,
    name: data.name,
    email: data.email,
    role: data.role,
    tenantId: data.tenantId,
    emailVerified: true,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(account).values({
    id: accountId,
    accountId: userId,
    providerId: "credential",
    userId: userId,
    password: hashedPassword,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id: userId,
    name: data.name,
    email: data.email,
    role: data.role,
    tenantId: data.tenantId,
    image: null,
    banned: false,
    createdAt: now,
  };
}

export async function deleteUser(id: string): Promise<boolean> {
  await db.delete(user).where(eq(user.id, id));
  return true;
}
