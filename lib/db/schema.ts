import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  varchar,
  integer,
  decimal,
  json,
} from "drizzle-orm/pg-core";

// Esquema de usuário estendido para suportar o modelo multi-tenant
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  // Campos adicionais para o modelo multi-tenant
  role: varchar("role", { length: 20 }).default("customer").notNull(), // super_admin, admin, barber, customer
  tenantId: text("tenant_id"), // Referência para o tenant
  // Campos adicionais para o plugin de admin do Better Auth
  banned: boolean("banned").default(false), // Indica se o usuário está banido
  banReason: text("ban_reason"), // Motivo do banimento
  banExpires: timestamp("ban_expires"), // Data de expiração do banimento
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Campo adicionado para suportar o plugin de admin do Better Auth
    impersonatedBy: text("impersonated_by"), // ID do admin que está personificando esta sessão
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// Novos esquemas para o sistema de agendamento

// Tabela de tenants (barbearias)
export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Tabela de serviços
export const services = pgTable("services", {
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  duration: integer("duration").notNull(), // duração em minutos
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Tabela de barbeiros
export const barbers = pgTable("barbers", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // Relação com usuário
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  specializations: json("specializations"), // Array de especializações
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Tabela de agendamentos
export const appointments = pgTable("appointments", {
  id: text("id").primaryKey(),
  serviceId: text("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "restrict" }), // Não apagar agendamento se serviço for removido
  barberId: text("barber_id")
    .notNull()
    .references(() => barbers.id, { onDelete: "restrict" }), // Não apagar agendamento se barbeiro for removido
  customerId: text("customer_id")
    .notNull()
    .references(() => user.id, { onDelete: "restrict" }), // Não apagar agendamento se cliente for removido
  tenantId: text("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  scheduledDate: timestamp("scheduled_date").notNull(), // Data e hora do agendamento
  status: varchar("status", { length: 20 }).default("scheduled").notNull(), // scheduled, completed, cancelled, no-show
  confirmed: boolean("confirmed").default(false).notNull(), // Se o cliente confirmou o agendamento
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Definindo relações

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  tenant: one(tenants, {
    fields: [user.tenantId],
    references: [tenants.id],
  }),
  barberProfile: one(barbers, {
    fields: [user.id],
    references: [barbers.userId],
  }),
  appointmentsAsCustomer: many(appointments),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const tenantRelations = relations(tenants, ({ many }) => ({
  users: many(user),
  services: many(services),
  appointments: many(appointments),
  barbers: many(barbers),
}));

export const serviceRelations = relations(services, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [services.tenantId],
    references: [tenants.id],
  }),
  appointments: many(appointments),
}));

export const barberRelations = relations(barbers, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [barbers.tenantId],
    references: [tenants.id],
  }),
  user: one(user, {
    fields: [barbers.userId],
    references: [user.id],
  }),
  appointments: many(appointments),
}));

export const appointmentRelations = relations(appointments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [appointments.tenantId],
    references: [tenants.id],
  }),
  service: one(services, {
    fields: [appointments.serviceId],
    references: [services.id],
  }),
  barber: one(barbers, {
    fields: [appointments.barberId],
    references: [barbers.id],
  }),
  customer: one(user, {
    fields: [appointments.customerId],
    references: [user.id],
  }),
}));

export const schema = {
  user,
  session,
  account,
  verification,
  tenants,
  services,
  barbers,
  appointments,
};
