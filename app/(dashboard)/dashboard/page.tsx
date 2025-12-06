import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignOutButton } from "@/components/auth/signout-button";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <h1 className="text-3xl font-bold">Welcome to your dashboard!</h1>
          <p className="text-muted-foreground text-center">
            You have successfully logged in and can access your account features
            here.
          </p>
          <div className="pt-4 w-full max-w-xs">
            <SignOutButton className="w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
