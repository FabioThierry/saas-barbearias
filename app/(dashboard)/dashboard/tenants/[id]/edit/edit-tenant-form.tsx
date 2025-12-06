"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateTenantAction, TenantFormState } from "@/lib/actions/tenants";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useActionState } from "react";

const tenantSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  domain: z.string().min(3, "Domain must be at least 3 characters").max(255).regex(/^[a-z0-9-]+$/, "Domain can only contain lowercase letters, numbers, and hyphens"),
});

type TenantFormData = z.infer<typeof tenantSchema>;

interface EditTenantFormProps {
  tenant: {
    id: string;
    name: string;
    domain: string;
  };
}

const initialState: TenantFormState = {};

export function EditTenantForm({ tenant }: EditTenantFormProps) {
  const router = useRouter();
  const updateAction = updateTenantAction.bind(null, tenant.id);
  const [state, formAction, isPending] = useActionState(updateAction, initialState);

  const {
    register,
    formState: { errors },
    setError,
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: tenant.name,
      domain: tenant.domain,
    },
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      router.push(`/dashboard/tenants/${tenant.id}`);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
    if (state.errors?.name) {
      setError("name", { message: state.errors.name[0] });
    }
    if (state.errors?.domain) {
      setError("domain", { message: state.errors.domain[0] });
    }
  }, [state, router, tenant.id, setError]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Barbershop Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="Enter barbershop name"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">Domain Slug</Label>
        <Input
          id="domain"
          {...register("domain")}
          placeholder="my-barbershop"
        />
        <p className="text-xs text-muted-foreground">
          Only lowercase letters, numbers, and hyphens allowed
        </p>
        {errors.domain && (
          <p className="text-sm text-destructive">{errors.domain.message}</p>
        )}
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Changes
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/dashboard/tenants/${tenant.id}`)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
