"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUserAction, UserFormState } from "@/lib/actions/users";
import { UserRole } from "@/lib/user-roles";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const barberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type BarberFormData = z.infer<typeof barberSchema>;

const initialState: UserFormState = {};

export function BarberForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createUserAction, initialState);

  const {
    register,
    formState: { errors },
    setError,
  } = useForm<BarberFormData>({
    resolver: zodResolver(barberSchema),
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      router.push("/dashboard/barbers");
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
    if (state.errors?.name) {
      setError("name", { message: state.errors.name[0] });
    }
    if (state.errors?.email) {
      setError("email", { message: state.errors.email[0] });
    }
    if (state.errors?.password) {
      setError("password", { message: state.errors.password[0] });
    }
  }, [state, router, setError]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="role" value={UserRole.Barber} />

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter barber's full name"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="barber@example.com"
        />
        <p className="text-xs text-muted-foreground">
          The barber will use this email to log in
        </p>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...register("password")}
          placeholder="Minimum 6 characters"
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Add Barber
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/barbers")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
