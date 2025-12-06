import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";
import { getAllUsers, getUsersByTenant } from "@/lib/services/users";
import { getAllTenants } from "@/lib/services/tenants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, Shield, UserCog, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

function getRoleIcon(role: string) {
  switch (role) {
    case UserRole.SuperAdmin:
      return <Shield className="h-4 w-4" />;
    case UserRole.Admin:
      return <UserCog className="h-4 w-4" />;
    case UserRole.Barber:
      return <UserCog className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
}

function getRoleBadgeVariant(role: string): "default" | "secondary" | "outline" | "destructive" {
  switch (role) {
    case UserRole.SuperAdmin:
      return "destructive";
    case UserRole.Admin:
      return "default";
    case UserRole.Barber:
      return "secondary";
    default:
      return "outline";
  }
}

export default async function UsersPage() {
  const session = await requireRole([UserRole.SuperAdmin, UserRole.Admin]);
  const isSuperAdmin = session.user.role === UserRole.SuperAdmin;

  const users = isSuperAdmin 
    ? await getAllUsers()
    : await getUsersByTenant(session.user.tenantId!);

  const tenants = isSuperAdmin ? await getAllTenants() : [];
  const tenantMap = new Map(tenants.map(t => [t.id, t.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">
            {isSuperAdmin ? "Manage all users in the system" : "Manage users in your barbershop"}
          </p>
        </div>
        <Link href="/dashboard/users/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </Link>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users yet</h3>
            <p className="text-muted-foreground mb-4">Get started by creating your first user.</p>
            <Link href="/dashboard/users/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>{users.length} users total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {user.name}
                        {user.banned && (
                          <Badge variant="destructive" className="text-xs">Banned</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {isSuperAdmin && user.tenantId && (
                      <span className="text-sm text-muted-foreground">
                        {tenantMap.get(user.tenantId) || "Unknown Tenant"}
                      </span>
                    )}
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(user.createdAt, "MMM d, yyyy")}
                    </span>
                    <Link href={`/dashboard/users/${user.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
