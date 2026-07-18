"use client";

import * as React from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, Shield, Key, Plus, Search, CheckCircle2, AlertCircle, 
  Trash2, UserCheck, Loader2, Mail, Phone, Calendar 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/use-toast";
import { getInitials, formatDate } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  avatarUrl?: string;
}

interface UsersResponse {
  items: UserProfile[];
  total: number;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
  const [newUserOpen, setNewUserOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<Partial<UserProfile> | null>(null);

  // Invite form state
  const [inviteForm, setInviteForm] = React.useState({
    name: "",
    email: "",
    role: "ADMISSIONS_COUNSELOR",
    phone: "",
  });

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Query users
  const { data, isLoading } = useQuery<UserProfile[]>({
    queryKey: ["users", debouncedSearch, roleFilter],
    queryFn: async () => {
      const p = new URLSearchParams({
        page: "1",
        limit: "100",
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(roleFilter ? { role: roleFilter } : {}),
      });
      // The API returns the array inside success.data
      const res = await apiFetch<UserProfile[] | UsersResponse>(`/users?${p}`);
      if (Array.isArray(res)) return res;
      return (res as UsersResponse).items || [];
    },
  });

  const usersList = data ?? [];

  // Mutations
  const inviteMutation = useMutation({
    mutationFn: (body: any) => 
      apiFetch<UserProfile>("/users?action=invite", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Invitation Dispatched", description: "The staff invitation link has been generated." });
      setNewUserOpen(false);
      setInviteForm({ name: "", email: "", role: "ADMISSIONS_COUNSELOR", phone: "" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => 
      apiFetch<UserProfile>(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User Updated", description: "Personnel profile modified successfully." });
      setEditingUser(null);
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      apiFetch<void>(`/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "Personnel Deactivated", description: "Staff account has been suspended." });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate(inviteForm);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.id) return;
    updateMutation.mutate({
      id: editingUser.id,
      body: {
        name: editingUser.name,
        phone: editingUser.phone,
        role: editingUser.role,
        isActive: editingUser.isActive,
      },
    });
  };

  // Helper to prettify role name
  const formatRole = (role: string) => {
    return role.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="space-y-8 pb-12 text-white">
      <PageHeader 
        title="User Management & Access Control (ACL)" 
        description="Administer departmental access level controls, assign roles, and audit system personnel credentials." 
        action={
          <Button onClick={() => setNewUserOpen(true)} className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105 text-xs font-bold">
            <Plus className="h-4 w-4 mr-2" />
            Invite System User
          </Button>
        }
      />

      {/* Search & Filter */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search staff by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-secondary/40 border-white/10 focus:border-primary text-sm font-medium text-white"
            />
          </div>
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="flex h-9 w-48 rounded-lg border border-white/10 bg-secondary/40 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none"
        >
          <option value="" className="bg-slate-900">All Roles</option>
          <option value="SUPER_ADMIN" className="bg-slate-900">Super Admin</option>
          <option value="ADMIN" className="bg-slate-900">Admin</option>
          <option value="MARKETING_MANAGER" className="bg-slate-900">Marketing Manager</option>
          <option value="CONTENT_MANAGER" className="bg-slate-900">Content Manager</option>
          <option value="ADMISSIONS_COUNSELOR" className="bg-slate-900">Admissions Counselor</option>
          <option value="PLACEMENT_MANAGER" className="bg-slate-900">Placement Manager</option>
          <option value="SUPPORT_STAFF" className="bg-slate-900">Support Staff</option>
        </select>
      </div>

      {/* Directory Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-white/5 rounded" />
                  <div className="h-3 w-48 bg-white/5 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : usersList.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          No personnel found matching filters.
        </div>
      ) : (
        <div className="space-y-4">
          {usersList.map((usr) => (
            <div key={usr.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-secondary/30 border border-white/5 hover:border-white/10 transition-all gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <Avatar className="h-12 w-12 border border-primary/30 shadow-md">
                  {usr.avatarUrl && <AvatarImage src={usr.avatarUrl} />}
                  <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">{getInitials(usr.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm font-bold text-white truncate block">
                      {usr.name}
                    </h3>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${usr.role === "SUPER_ADMIN" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>
                      {formatRole(usr.role)}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${usr.isActive ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border-rose-500/30"}`}>
                      {usr.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {usr.email}</span>
                    {usr.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {usr.phone}</span>}
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined {formatDate(usr.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/10 justify-end">
                <Button size="sm" onClick={() => setEditingUser(usr)} className="bg-primary/20 hover:bg-primary/30 text-white border border-primary/30 text-xs font-bold py-1 px-3 h-8">
                  <Key className="h-3.5 w-3.5 mr-1.5" /> Modify Role
                </Button>
                {usr.isActive && (
                  <Button size="sm" onClick={() => { if (confirm("Suspend this user?")) deleteMutation.mutate(usr.id); }} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold py-1 px-3 h-8">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite User Dialog */}
      <Dialog open={newUserOpen} onOpenChange={setNewUserOpen}>
        <DialogContent className="max-w-md glass-panel border-white/10 bg-slate-900/95 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Invite System User
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvite} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Staff Full Name *</label>
              <Input 
                value={inviteForm.name} 
                onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g.Capt. Vikram Singh" 
                required 
                className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Work Email Address *</label>
              <Input 
                value={inviteForm.email} 
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. vikram@airborneaviation.in" 
                type="email" 
                required 
                className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Primary Administration Role</label>
              <select 
                value={inviteForm.role}
                onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="SUPER_ADMIN" className="bg-slate-900">Super Admin</option>
                <option value="ADMIN" className="bg-slate-900">Admin</option>
                <option value="MARKETING_MANAGER" className="bg-slate-900">Marketing Manager</option>
                <option value="CONTENT_MANAGER" className="bg-slate-900">Content Manager</option>
                <option value="ADMISSIONS_COUNSELOR" className="bg-slate-900">Admissions Counselor</option>
                <option value="PLACEMENT_MANAGER" className="bg-slate-900">Placement Manager</option>
                <option value="SUPPORT_STAFF" className="bg-slate-900">Support Staff</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground">Phone Number</label>
              <Input 
                value={inviteForm.phone} 
                onChange={(e) => setInviteForm(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. +919876543210" 
                className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" 
              />
            </div>
            
            <DialogFooter className="pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => setNewUserOpen(false)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
              <Button type="submit" disabled={inviteMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                {inviteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Dispatch Invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(o) => !o && setEditingUser(null)}>
        <DialogContent className="max-w-md glass-panel border-white/10 bg-slate-900/95 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" /> Modify Staff Details
            </DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdateUser} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Staff Full Name</label>
                <Input 
                  value={editingUser.name || ""} 
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                  required 
                  className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Phone Number</label>
                <Input 
                  value={editingUser.phone || ""} 
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, phone: e.target.value }) : null)}
                  className="bg-secondary/40 border-white/10 text-xs font-semibold text-white" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Administration Role</label>
                <select 
                  value={editingUser.role || "ADMISSIONS_COUNSELOR"}
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, role: e.target.value }) : null)}
                  className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="SUPER_ADMIN" className="bg-slate-900">Super Admin</option>
                  <option value="ADMIN" className="bg-slate-900">Admin</option>
                  <option value="MARKETING_MANAGER" className="bg-slate-900">Marketing Manager</option>
                  <option value="CONTENT_MANAGER" className="bg-slate-900">Content Manager</option>
                  <option value="ADMISSIONS_COUNSELOR" className="bg-slate-900">Admissions Counselor</option>
                  <option value="PLACEMENT_MANAGER" className="bg-slate-900">Placement Manager</option>
                  <option value="SUPPORT_STAFF" className="bg-slate-900">Support Staff</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground">Status</label>
                <select 
                  value={editingUser.isActive ? "true" : "false"}
                  onChange={(e) => setEditingUser(prev => prev ? ({ ...prev, isActive: e.target.value === "true" }) : null)}
                  className="flex h-9 w-full rounded-lg border border-white/10 bg-secondary/60 px-3 py-1 text-xs font-bold text-white focus-visible:outline-none"
                >
                  <option value="true">Active Personnel</option>
                  <option value="false">Suspended / Inactive</option>
                </select>
              </div>
              
              <DialogFooter className="pt-4 border-t border-white/10">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)} className="border-white/10 hover:bg-white/5 text-xs font-bold">Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90 text-white text-xs font-bold shadow-lg shadow-primary/20">
                  {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
