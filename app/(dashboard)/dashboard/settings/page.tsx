import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { UserRole } from "@/lib/user-roles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Scissors,
  Building2,
  Settings,
  User,
  Lock,
} from "lucide-react";

async function SettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { user } = session;

  // Only Super Admins and Admins can access settings
  if (user.role !== UserRole.SuperAdmin && user.role !== UserRole.Admin) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account and system settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-muted-foreground">
                  {user.email}
                </div>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Password</div>
                <div className="text-sm text-muted-foreground">
                  Last changed recently
                </div>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Email and SMS preferences
                </div>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>

        {user.role === UserRole.Admin && user.tenantId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Settings
              </CardTitle>
              <CardDescription>
                Manage your barbershop information and services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Business Information</div>
                  <div className="text-sm text-muted-foreground">
                    Name, address, contact
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Services</div>
                  <div className="text-sm text-muted-foreground">
                    Haircuts, shaves, etc.
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Staff</div>
                  <div className="text-sm text-muted-foreground">
                    Barbers and team members
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {user.role === UserRole.SuperAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                System Settings
              </CardTitle>
              <CardDescription>
                Manage system-wide configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Tenants</div>
                  <div className="text-sm text-muted-foreground">
                    Manage all barbershops
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">Admin Users</div>
                  <div className="text-sm text-muted-foreground">
                    System administrators
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">System Status</div>
                  <div className="text-sm text-muted-foreground">
                    Health and performance
                  </div>
                </div>
                <Badge variant="secondary">Operational</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Role</div>
                <div className="text-sm text-muted-foreground">
                  {user.role === UserRole.SuperAdmin
                    ? "Super Administrator"
                    : user.role === UserRole.Admin
                    ? "Administrator"
                    : user.role === UserRole.Barber
                    ? "Barber"
                    : "Customer"}
                </div>
              </div>
              <Badge variant="outline">
                {user.role === UserRole.SuperAdmin
                  ? "Super Admin"
                  : user.role === UserRole.Admin
                  ? "Admin"
                  : user.role === UserRole.Barber
                  ? "Barber"
                  : "Customer"}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">Tenant</div>
                <div className="text-sm text-muted-foreground">
                  {user.tenantId
                    ? "Associated with barbershop"
                    : "No barbershop assigned"}
                </div>
              </div>
              {user.tenantId && <Badge variant="secondary">Active</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SettingsPage;
