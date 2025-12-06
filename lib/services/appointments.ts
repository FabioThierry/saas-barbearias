import { db } from "@/lib/db";
import { appointments, services, barbers, user } from "@/lib/db/schema";
import { eq, and, gte, lte, count, desc, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface Appointment {
  id: string;
  serviceId: string;
  barberId: string;
  customerId: string;
  tenantId: string;
  scheduledDate: Date;
  status: string;
  confirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentWithDetails extends Appointment {
  serviceName: string;
  serviceDuration: number;
  servicePrice: string;
  barberName: string;
  customerName: string;
  customerEmail: string;
}

export async function getAppointmentsByTenant(
  tenantId: string
): Promise<AppointmentWithDetails[]> {
  const result = await db
    .select({
      id: appointments.id,
      serviceId: appointments.serviceId,
      barberId: appointments.barberId,
      customerId: appointments.customerId,
      tenantId: appointments.tenantId,
      scheduledDate: appointments.scheduledDate,
      status: appointments.status,
      confirmed: appointments.confirmed,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      serviceName: services.name,
      serviceDuration: services.duration,
      servicePrice: services.price,
      barberUserId: barbers.userId,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .innerJoin(barbers, eq(appointments.barberId, barbers.id))
    .where(eq(appointments.tenantId, tenantId))
    .orderBy(desc(appointments.scheduledDate));

  const customerIds = [...new Set(result.map((r) => r.customerId))];
  const barberUserIds = [...new Set(result.map((r) => r.barberUserId))];
  const allUserIds = [...new Set([...customerIds, ...barberUserIds])];

  let userMap = new Map<string, { id: string; name: string; email: string }>();
  
  if (allUserIds.length > 0) {
    const users = await db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(inArray(user.id, allUserIds));

    userMap = new Map(users.map((u) => [u.id, u]));
  }

  return result.map((r) => ({
    id: r.id,
    serviceId: r.serviceId,
    barberId: r.barberId,
    customerId: r.customerId,
    tenantId: r.tenantId,
    scheduledDate: r.scheduledDate,
    status: r.status,
    confirmed: r.confirmed,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    serviceName: r.serviceName,
    serviceDuration: r.serviceDuration,
    servicePrice: r.servicePrice,
    barberName: userMap.get(r.barberUserId)?.name || "Unknown",
    customerName: userMap.get(r.customerId)?.name || "Unknown",
    customerEmail: userMap.get(r.customerId)?.email || "",
  }));
}

export async function getAppointmentsByBarber(
  barberId: string,
  tenantId: string
): Promise<AppointmentWithDetails[]> {
  const result = await db
    .select({
      id: appointments.id,
      serviceId: appointments.serviceId,
      barberId: appointments.barberId,
      customerId: appointments.customerId,
      tenantId: appointments.tenantId,
      scheduledDate: appointments.scheduledDate,
      status: appointments.status,
      confirmed: appointments.confirmed,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      serviceName: services.name,
      serviceDuration: services.duration,
      servicePrice: services.price,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(eq(appointments.barberId, barberId), eq(appointments.tenantId, tenantId))
    )
    .orderBy(desc(appointments.scheduledDate));

  return result.map((r) => ({
    ...r,
    barberName: "",
    customerName: "",
    customerEmail: "",
  }));
}

export async function getAppointmentsByCustomer(
  customerId: string
): Promise<AppointmentWithDetails[]> {
  const result = await db
    .select({
      id: appointments.id,
      serviceId: appointments.serviceId,
      barberId: appointments.barberId,
      customerId: appointments.customerId,
      tenantId: appointments.tenantId,
      scheduledDate: appointments.scheduledDate,
      status: appointments.status,
      confirmed: appointments.confirmed,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      serviceName: services.name,
      serviceDuration: services.duration,
      servicePrice: services.price,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(eq(appointments.customerId, customerId))
    .orderBy(desc(appointments.scheduledDate));

  return result.map((r) => ({
    ...r,
    barberName: "",
    customerName: "",
    customerEmail: "",
  }));
}

export async function getTodayAppointments(
  tenantId: string
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await db
    .select({ count: count() })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.scheduledDate, today),
        lte(appointments.scheduledDate, tomorrow)
      )
    );

  return result[0]?.count || 0;
}

export async function getWeekAppointments(
  tenantId: string
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const result = await db
    .select({ count: count() })
    .from(appointments)
    .where(
      and(
        eq(appointments.tenantId, tenantId),
        gte(appointments.scheduledDate, today),
        lte(appointments.scheduledDate, nextWeek)
      )
    );

  return result[0]?.count || 0;
}

export async function createAppointment(data: {
  serviceId: string;
  barberId: string;
  customerId: string;
  tenantId: string;
  scheduledDate: Date;
}): Promise<Appointment> {
  const id = randomUUID();
  const now = new Date();

  await db.insert(appointments).values({
    id,
    serviceId: data.serviceId,
    barberId: data.barberId,
    customerId: data.customerId,
    tenantId: data.tenantId,
    scheduledDate: data.scheduledDate,
    status: "scheduled",
    confirmed: false,
    createdAt: now,
    updatedAt: now,
  });

  return {
    id,
    serviceId: data.serviceId,
    barberId: data.barberId,
    customerId: data.customerId,
    tenantId: data.tenantId,
    scheduledDate: data.scheduledDate,
    status: "scheduled",
    confirmed: false,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateAppointmentStatus(
  id: string,
  status: string
): Promise<boolean> {
  await db
    .update(appointments)
    .set({ status, updatedAt: new Date() })
    .where(eq(appointments.id, id));
  return true;
}

export async function confirmAppointment(id: string): Promise<boolean> {
  await db
    .update(appointments)
    .set({ confirmed: true, updatedAt: new Date() })
    .where(eq(appointments.id, id));
  return true;
}

export async function cancelAppointment(id: string): Promise<boolean> {
  await db
    .update(appointments)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(appointments.id, id));
  return true;
}
