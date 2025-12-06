import { db } from "@/lib/db";
import { tenants, user, services, appointments, barbers } from "@/lib/db/schema";
import { eq, count, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface Tenant {
  id: string;
  name: string;
  domain: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantWithStats extends Tenant {
  userCount: number;
  serviceCount: number;
  appointmentCount: number;
}

export async function getAllTenants(): Promise<Tenant[]> {
  return await db.select().from(tenants).orderBy(tenants.createdAt);
}

export async function getTenantById(id: string): Promise<Tenant | null> {
  const result = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, id))
    .limit(1);
  return result[0] || null;
}

export async function getTenantByDomain(domain: string): Promise<Tenant | null> {
  const result = await db
    .select()
    .from(tenants)
    .where(eq(tenants.domain, domain))
    .limit(1);
  return result[0] || null;
}

export async function createTenant(data: {
  name: string;
  domain: string;
}): Promise<Tenant> {
  const id = randomUUID();
  const now = new Date();

  await db.insert(tenants).values({
    id,
    name: data.name,
    domain: data.domain,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    name: data.name,
    domain: data.domain,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateTenant(
  id: string,
  data: { name?: string; domain?: string }
): Promise<Tenant | null> {
  const existing = await getTenantById(id);
  if (!existing) return null;

  await db
    .update(tenants)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, id));

  return getTenantById(id);
}

export async function deleteTenant(id: string): Promise<boolean> {
  const result = await db.delete(tenants).where(eq(tenants.id, id));
  return true;
}

export async function getTenantStats(tenantId: string) {
  const [userResult, serviceResult, appointmentResult, barberResult] =
    await Promise.all([
      db
        .select({ count: count() })
        .from(user)
        .where(eq(user.tenantId, tenantId)),
      db
        .select({ count: count() })
        .from(services)
        .where(eq(services.tenantId, tenantId)),
      db
        .select({ count: count() })
        .from(appointments)
        .where(eq(appointments.tenantId, tenantId)),
      db
        .select({ count: count() })
        .from(barbers)
        .where(eq(barbers.tenantId, tenantId)),
    ]);

  return {
    userCount: userResult[0]?.count || 0,
    serviceCount: serviceResult[0]?.count || 0,
    appointmentCount: appointmentResult[0]?.count || 0,
    barberCount: barberResult[0]?.count || 0,
  };
}

export async function getGlobalStats() {
  const [tenantResult, userResult, serviceResult, appointmentResult] =
    await Promise.all([
      db.select({ count: count() }).from(tenants),
      db.select({ count: count() }).from(user),
      db.select({ count: count() }).from(services),
      db.select({ count: count() }).from(appointments),
    ]);

  return {
    tenantCount: tenantResult[0]?.count || 0,
    userCount: userResult[0]?.count || 0,
    serviceCount: serviceResult[0]?.count || 0,
    appointmentCount: appointmentResult[0]?.count || 0,
  };
}
