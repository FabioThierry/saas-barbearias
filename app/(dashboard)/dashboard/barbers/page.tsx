import { requireRole } from "@/lib/session";
import { UserRole } from "@/lib/user-roles";
import { getBarbersByTenant } from "@/lib/services/users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, Plus, Mail } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default async function BarbersPage() {
  const session = await requireRole([UserRole.Admin]);

  if (!session.user.tenantId) {
    return <div>No tenant assigned</div>;
  }

  const barbers = await getBarbersByTenant(session.user.tenantId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Barbers</h2>
          <p className="text-muted-foreground">Manage your barbershop team</p>
        </div>
        <Link href="/dashboard/barbers/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Barber
          </Button>
        </Link>
      </div>

      {barbers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UserCog className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No barbers yet</h3>
            <p className="text-muted-foreground mb-4">
              Get started by adding your first barber.
            </p>
            <Link href="/dashboard/barbers/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Barber
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {barbers.map((barber) => (
            <Card key={barber.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <UserCog className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {barber.name}
                      {barber.banned && (
                        <Badge variant="destructive" className="text-xs">
                          Banned
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Mail className="h-4 w-4" />
                  <span>{barber.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Joined {format(barber.createdAt, "MMM d, yyyy")}
                  </span>
                  <Link href={`/dashboard/users/${barber.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
