import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";
import { getUserById } from "@/lib/services/users";
import { getTenantById } from "@/lib/services/tenants";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, UserCog, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./user-actions";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

function getRoleIcon(role: string) {
  switch (role) {
    case UserRole.SuperAdmin:
      return <Shield className="h-6 w-6" />;
    case UserRole.Admin:
    case UserRole.Barber:
      return <UserCog className="h-6 w-6" />;
    default:
      return <User className="h-6 w-6" />;
  }
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const session = await requireRole([UserRole.SuperAdmin, UserRole.Admin]);
  const isSuperAdmin = session.user.role === UserRole.SuperAdmin;

  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  if (!isSuperAdmin && user.tenantId !== session.user.tenantId) {
    notFound();
  }

  const tenant = user.tenantId ? await getTenantById(user.tenantId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/users">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            {getRoleIcon(user.role)}
            {user.name}
          </h2>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <UserActions user={user} isSuperAdmin={isSuperAdmin} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Details about this user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Role</span>
              <Badge>{user.role}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              {user.banned ? (
                <Badge variant="destructive">Banned</Badge>
              ) : (
                <Badge variant="outline">Active</Badge>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span className="font-medium">{format(user.createdAt, "MMM d, yyyy")}</span>
            </div>
          </CardContent>
        </Card>

        {tenant && (
          <Card>
            <CardHeader>
              <CardTitle>Barbershop</CardTitle>
              <CardDescription>Associated tenant</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{tenant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Domain</span>
                <span className="font-medium">{tenant.domain}</span>
              </div>
              {isSuperAdmin && (
                <Link href={`/dashboard/tenants/${tenant.id}`}>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    View Tenant
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
