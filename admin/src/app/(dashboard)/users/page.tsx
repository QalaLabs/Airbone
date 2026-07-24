"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Shield, Plus, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { getInitials } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MARKETING_MANAGER",
  "CONTENT_MANAGER",
  "ADMISSIONS_COUNSELOR",
  "PLACEMENT_MANAGER",
  "SUPPORT_STAFF",
  "TEACHER",
  "STUDENT",
];

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  MARKETING_MANAGER: "Marketing Manager",
  CONTENT_MANAGER: "Content Manager",
  ADMISSIONS_COUNSELOR: "Admissions Counselor",
  PLACEMENT_MANAGER: "Placement Manager",
  SUPPORT_STAFF: "Support Staff",
  TEACHER: "Teacher",
  STUDENT: "Student",
};

interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
  campus?: { name: string } | null;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [editingUser, setEditingUser] = React.useState<SystemUser | null>(null);
  const [newUserOpen, setNewUserOpen] = React.useState(false);
  const [deactivateTarget, setDeactivateTarget] = React.useState<SystemUser | null>(null);

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["users", search],
    queryFn: () => apiFetch<SystemUser[]>(`/users?${search ? `search=${encodeURIComponent(search)}&` : ""}limit=100`),
  });


  const inviteMutation = useMutation({
    mutationFn: (body: { email: string; name: string; role: string }) =>
      apiFetch("/users?action=invite", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Invitation sent", description: "The user will receive an email to set up their account." });
      setNewUserOpen(false);
    },
    onError: (err: unknown) => toast({ title: "Invite failed", description: err instanceof Error ? err.message : String(err), variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { name?: string; role?: string } }) =>
      apiFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User updated" });
      setEditingUser(null);
    },
    onError: (err: unknown) => toast({ title: "Update failed", description: err instanceof Error ? err.message : String(err), variant: "destructive" }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User deactivated" });
      setDeactivateTarget(null);
    },
    onError: (err: unknown) => toast({ title: "Deactivate failed", description: err instanceof Error ? err.message : String(err), variant: "destructive" }),
  });

  const handleInvite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    inviteMutation.mutate({
      email: String(form.get("email")),
      name: String(form.get("name")),
      role: String(form.get("role")),
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    const form = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingUser.id,
      body: { name: String(form.get("name")), role: String(form.get("role")) },
    });
  };

  const activeCount = users.filter((u) => u.isActive).length;
  const superAdminCount = users.filter((u) => u.role === "SUPER_ADMIN").length;

  if (isLoading) return <div className="p-6 text-white text-xs">Loading users...</div>;
  if (error) return <div className="p-6 text-red-500 font-bold">Error loading users: {error instanceof Error ? error.message : String(error)}</div>;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="User Management"
        description="Manage staff accounts, roles, and access."
        action={
          <Button onClick={() => setNewUserOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 text-xs font-bold">
            <Plus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: "Active Users", value: String(activeCount), color: "text-emerald-400", bg: "bg-emerald-500/10", icon: Users },
          { title: "Super Admins", value: String(superAdminCount), color: "text-amber-400", bg: "bg-amber-500/10", icon: Shield },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-muted-foreground">{kpi.title}</span>
                <div className="text-2xl font-bold text-white tracking-tight mt-1">{kpi.value}</div>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpi.bg} ${kpi.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Staff Directory
          </h3>
          <Input placeholder="Search by name, email, role..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary/40 border-white/10 text-xs font-semibold w-64 text-white" />
        </div>

        <div className="space-y-3 pt-2">
          {users.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">No users found.</p>
          )}
          {users.map((usr) => (
            <div key={usr.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-all gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <Avatar className="h-12 w-12 border border-primary/30 shadow-md">
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">{getInitials(usr.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-white truncate">{usr.name}</span>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${usr.role === "SUPER_ADMIN" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                      {ROLE_LABELS[usr.role] ?? usr.role}
                    </span>
                    {!usr.isActive && (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border bg-secondary text-muted-foreground border-white/10">
                        Deactivated
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {usr.email}{usr.campus?.name ? ` • ${usr.campus.name}` : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/10 justify-end">
                <Button size="sm" onClick={() => setEditingUser(usr)} variant="outline" className="border-white/10 hover:bg-white/5 text-xs font-bold text-white py-1 px-3 h-8">
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs font-bold text-rose-400 hover:bg-rose-500/10 py-1 px-3 h-8"
                  disabled={!usr.isActive}
                  onClick={() => setDeactivateTarget(usr)}
                >
                  <UserX className="h-3.5 w-3.5 mr-1.5" /> Deactivate
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent className="max-w-lg glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Edit {editingUser?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Full Name</label>
              <Input name="name" defaultValue={editingUser?.name} required className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Role</label>
              <select name="role" defaultValue={editingUser?.role} className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                {ROLES.map((r) => <option key={r} value={r} className="bg-slate-900">{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <DialogFooter className="pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
        <DialogContent className="max-w-lg glass-panel border-white/10 bg-slate-900/95">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Invite User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Full Name *</label>
              <Input name="name" required className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Work Email *</label>
              <Input name="email" type="email" required className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Role</label>
              <select name="role" defaultValue="SUPPORT_STAFF" className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                {ROLES.map((r) => <option key={r} value={r} className="bg-slate-900">{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <DialogFooter className="pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => setNewUserOpen(false)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
              <Button type="submit" disabled={inviteMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deactivate Confirm */}
      <AlertDialog open={!!deactivateTarget} onOpenChange={(o) => !o && setDeactivateTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate user?</AlertDialogTitle>
            <AlertDialogDescription>
              {deactivateTarget?.name} will lose access immediately. This can be reversed by an admin later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deactivateTarget && deactivateMutation.mutate(deactivateTarget.id)}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
