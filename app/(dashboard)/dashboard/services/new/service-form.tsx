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
import { createServiceAction, ServiceFormState } from "@/lib/actions/services";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const serviceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  duration: z.coerce.number().min(5, "Duration must be at least 5 minutes").max(480, "Duration cannot exceed 8 hours"),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price format"),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const initialState: ServiceFormState = {};

export function ServiceForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createServiceAction, initialState);

  const {
    register,
    formState: { errors },
    setError,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      router.push("/dashboard/services");
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
    if (state.errors?.name) {
      setError("name", { message: state.errors.name[0] });
    }
    if (state.errors?.duration) {
      setError("duration", { message: state.errors.duration[0] });
    }
    if (state.errors?.price) {
      setError("price", { message: state.errors.price[0] });
    }
  }, [state, router, setError]);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Service Name</Label>
        <Input
          id="name"
          {...register("name")}
          placeholder="e.g., Haircut, Beard Trim"
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min="5"
            max="480"
            {...register("duration")}
            placeholder="30"
          />
          {errors.duration && (
            <p className="text-sm text-destructive">{errors.duration.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price ($)</Label>
          <Input
            id="price"
            type="text"
            {...register("price")}
            placeholder="25.00"
          />
          {errors.price && (
            <p className="text-sm text-destructive">{errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create Service
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/services")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
