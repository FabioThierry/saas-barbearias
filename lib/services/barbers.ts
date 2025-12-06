import { db } from "@/lib/db";
import { barbers, user } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface BarberWithUser {
  id: string;
  userId: string;
  tenantId: string;
  name: string;
  email: string;
  specializations: string[] | null;
  createdAt: Date;
}

export async function getBarbersByTenantWithProfile(
  tenantId: string
): Promise<BarberWithUser[]> {
  const result = await db
    .select({
      id: barbers.id,
      userId: barbers.userId,
      tenantId: barbers.tenantId,
      name: user.name,
      email: user.email,
      specializations: barbers.specializations,
      createdAt: barbers.createdAt,
    })
    .from(barbers)
    .innerJoin(user, eq(barbers.userId, user.id))
    .where(eq(barbers.tenantId, tenantId))
    .orderBy(user.name);

  return result.map((r) => ({
    ...r,
    specializations: r.specializations as string[] | null,
  }));
}

export async function getBarberById(id: string): Promise<BarberWithUser | null> {
  const result = await db
    .select({
      id: barbers.id,
      userId: barbers.userId,
      tenantId: barbers.tenantId,
      name: user.name,
      email: user.email,
      specializations: barbers.specializations,
      createdAt: barbers.createdAt,
    })
    .from(barbers)
    .innerJoin(user, eq(barbers.userId, user.id))
    .where(eq(barbers.id, id))
    .limit(1);

  if (!result.length) return null;

  return {
    ...result[0],
    specializations: result[0].specializations as string[] | null,
  };
}

export async function getBarberByUserId(
  userId: string
): Promise<BarberWithUser | null> {
  const result = await db
    .select({
      id: barbers.id,
      userId: barbers.userId,
      tenantId: barbers.tenantId,
      name: user.name,
      email: user.email,
      specializations: barbers.specializations,
      createdAt: barbers.createdAt,
    })
    .from(barbers)
    .innerJoin(user, eq(barbers.userId, user.id))
    .where(eq(barbers.userId, userId))
    .limit(1);

  if (!result.length) return null;

  return {
    ...result[0],
    specializations: result[0].specializations as string[] | null,
  };
}
