import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { UserRole, getPermissions, type Permissions } from "@/lib/user-roles";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
  image: string | null;
}

export interface SessionData {
  user: SessionUser;
  permissions: Permissions;
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return null;
    }

    const dbUser = await db
      .select({
        id: userTable.id,
        name: userTable.name,
        email: userTable.email,
        role: userTable.role,
        tenantId: userTable.tenantId,
        image: userTable.image,
      })
      .from(userTable)
      .where(eq(userTable.id, session.user.id))
      .limit(1);

    if (!dbUser.length) {
      return null;
    }

    const userData = dbUser[0];
    const role = userData.role as UserRole;
    const permissions = getPermissions(role);

    return {
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: role,
        tenantId: userData.tenantId,
        image: userData.image,
      },
      permissions,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<SessionData> {
  const session = await requireSession();
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session;
}
