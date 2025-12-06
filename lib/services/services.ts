import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getServicesByTenant(tenantId: string): Promise<Service[]> {
  return await db
    .select()
    .from(services)
    .where(eq(services.tenantId, tenantId))
    .orderBy(services.name);
}

export async function getServiceById(id: string): Promise<Service | null> {
  const result = await db
    .select()
    .from(services)
    .where(eq(services.id, id))
    .limit(1);
  return result[0] || null;
}

export async function createService(data: {
  name: string;
  duration: number;
  price: string;
  tenantId: string;
}): Promise<Service> {
  const id = randomUUID();
  const now = new Date();

  await db.insert(services).values({
    id,
    name: data.name,
    duration: data.duration,
    price: data.price,
    tenantId: data.tenantId,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    name: data.name,
    duration: data.duration,
    price: data.price,
    tenantId: data.tenantId,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateService(
  id: string,
  data: { name?: string; duration?: number; price?: string }
): Promise<Service | null> {
  const existing = await getServiceById(id);
  if (!existing) return null;

  await db
    .update(services)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(services.id, id));

  return getServiceById(id);
}

export async function deleteService(id: string): Promise<boolean> {
  await db.delete(services).where(eq(services.id, id));
  return true;
}

export async function getServiceCount(tenantId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(services)
    .where(eq(services.tenantId, tenantId));
  return result[0]?.count || 0;
}
