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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserAction, UserFormState } from "@/lib/actions/users";
import { UserRole } from "@/lib/user-roles";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([UserRole.Admin, UserRole.Barber, UserRole.Customer]),
  tenantId: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  tenants: { id: string; name: string }[];
  isSuperAdmin: boolean;
  preselectedTenantId: string | null;
}

const initialState: UserFormState = {};

export function UserForm({ tenants, isSuperAdmin, preselectedTenantId }: UserFormProps) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createUserAction, initialState);

  const {
    register,
    formState: { errors },
    setError,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: UserRole.Barber,
      tenantId: preselectedTenantId || undefined,
    },
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      router.push("/dashboard/users");
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

  const availableRoles = isSuperAdmin 
    ? [UserRole.Admin, UserRole.Barber, UserRole.Customer]
    : [UserRole.Barber, UserRole.Customer];

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter full name"
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
          placeholder="user@example.com"
        />
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

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select name="role" defaultValue={UserRole.Barber}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      {isSuperAdmin && (
        <div className="space-y-2">
          <Label htmlFor="tenantId">Barbershop (Tenant)</Label>
          <Select name="tenantId" defaultValue={preselectedTenantId || undefined}>
            <SelectTrigger>
              <SelectValue placeholder="Select barbershop" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Admin users must be assigned to a barbershop
          </p>
          {errors.tenantId && (
            <p className="text-sm text-destructive">{errors.tenantId.message}</p>
          )}
        </div>
      )}

      {!isSuperAdmin && preselectedTenantId && (
        <input type="hidden" name="tenantId" value={preselectedTenantId} />
      )}

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create User
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/users")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
