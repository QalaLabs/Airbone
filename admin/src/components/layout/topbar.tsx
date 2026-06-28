"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { LogOut, User, Settings, Bell, Search, Command } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { CommandPalette } from "./command-palette";

interface TopbarProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
}

export function Topbar({ user }: TopbarProps) {
  const [paletteOpen, setPaletteOpen] = React.useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center justify-between w-full h-9 px-3 rounded-lg border border-border bg-secondary/40 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all group shadow-inner"
          >
            <div className="flex items-center gap-2 text-sm">
              <Search className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
              <span>Search modules, CRM, quick actions...</span>
            </div>
            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-white/10 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <Command className="h-3 w-3" />K
            </kbd>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-xl p-1.5 hover:bg-accent transition-colors outline-none border border-transparent hover:border-white/10">
                <Avatar className="h-8 w-8 border border-primary/20 shadow-sm">
                  {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
                  <AvatarFallback className="text-xs bg-primary/20 text-primary font-bold">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-foreground leading-none">{user.name}</p>
                  <p className="text-[11px] text-primary font-medium mt-1">{user.role.replace("_", " ")}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-panel border-white/10">
              <DropdownMenuLabel className="font-normal p-3">
                <p className="text-sm font-bold text-white">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="cursor-pointer py-2 hover:bg-white/5">
                <User className="mr-2 h-4 w-4 text-primary" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-2 hover:bg-white/5">
                <Settings className="mr-2 h-4 w-4 text-primary" />
                <span>System Configurations</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer py-2 hover:bg-destructive/20">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
