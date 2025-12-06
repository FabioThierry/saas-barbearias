"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { banUserAction, unbanUserAction, deleteUserAction } from "@/lib/actions/users";
import { toast } from "sonner";
import { Ban, Trash2, Loader2, CheckCircle } from "lucide-react";
import { UserRole } from "@/lib/user-roles";

interface UserActionsProps {
  user: {
    id: string;
    name: string;
    role: string;
    banned: boolean | null;
  };
  isSuperAdmin: boolean;
}

export function UserActions({ user, isSuperAdmin }: UserActionsProps) {
  const router = useRouter();
  const [banOpen, setBanOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canDelete = isSuperAdmin && user.role !== UserRole.SuperAdmin;
  const canBan = user.role !== UserRole.SuperAdmin;

  async function handleBan() {
    if (!banReason.trim()) {
      toast.error("Please provide a reason for banning");
      return;
    }
    setIsLoading(true);
    try {
      const result = await banUserAction(user.id, banReason);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to ban user");
    } finally {
      setIsLoading(false);
      setBanOpen(false);
      setBanReason("");
    }
  }

  async function handleUnban() {
    setIsLoading(true);
    try {
      const result = await unbanUserAction(user.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to unban user");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsLoading(true);
    try {
      const result = await deleteUserAction(user.id);
      if (result.success) {
        toast.success(result.message);
        router.push("/dashboard/users");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete user");
    } finally {
      setIsLoading(false);
      setDeleteOpen(false);
    }
  }

  return (
    <div className="flex gap-2">
      {canBan && (
        user.banned ? (
          <Button variant="outline" onClick={handleUnban} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
            Unban
          </Button>
        ) : (
          <Dialog open={banOpen} onOpenChange={setBanOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Ban className="h-4 w-4 mr-2" />
                Ban
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ban User</DialogTitle>
                <DialogDescription>
                  Ban &quot;{user.name}&quot; from accessing the system. You can unban them later.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor="banReason">Reason for ban</Label>
                <Input
                  id="banReason"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Enter reason for ban"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setBanOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleBan} disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Ban User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      )}

      {canDelete && (
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{user.name}&quot;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Delete User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
