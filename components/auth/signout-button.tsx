"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SignOutButton({
  variant = "outline",
  className,
  ...props
}: {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      await signOutAction();
      // The signOutAction redirects, so we might not reach this code
    } catch (err) {
      toast.error("An error occurred during sign out");
      setIsLoading(false);
      // Optionally redirect manually if the action fails to redirect
      // router.push("/login");
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      disabled={isLoading}
      className={className}
      {...props}
    >
      {isLoading ? "Signing out..." : "Sign out"}
    </Button>
  );
}
