"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { ChevronDown, ChevronRight, LogOut } from "lucide-react";

import { MENU_CONFIG } from "@/lib/menu";
import { canAccess } from "@/lib/permissions";
import { connectSocket, disconnectSocket } from "@/lib/socket";

export default function Layout({ children }: any) {
  const [user, setUser] = useState<any>(null);
  const [state, setState] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();
  const { orgCode } = useParams();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!stored || !token) {
      router.replace("/");
      return;
    }

    const parsed = JSON.parse(stored);

    if (parsed.orgCode !== orgCode) {
      router.replace(`/${parsed.orgCode}/dashboard`);
      return;
    }

    setUser(parsed);
    connectSocket(token);

    const initial: any = {};
    MENU_CONFIG.forEach((g) => (initial[g.key] = g.open));
    setState(initial);

    setLoading(false);

    return () => {
      disconnectSocket();
    };
  }, []);

  const toggle = (key: string) => {
    setState((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; Max-Age=0; path=/";
    disconnectSocket();
    router.replace("/");
  };

  if (loading) return null;

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="text-center font-semibold text-lg">{orgCode}</div>
        </SidebarHeader>

        <SidebarContent>
          {MENU_CONFIG.map((group) => {
            const items = group.items.filter((item) =>
              canAccess(user, item.module, item.permission),
            );

            if (!items.length) return null;

            return (
              <Collapsible
                key={group.key}
                open={state[group.key]}
                onOpenChange={() => toggle(group.key)}
              >
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="flex justify-between cursor-pointer">
                      {group.label}
                      {state[group.key] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {items.map((item) => {
                          const active = pathname === `/${orgCode}${item.href}`;

                          return (
                            <SidebarMenuItem key={item.href}>
                              <SidebarMenuButton
                                onClick={() =>
                                  router.push(`/${orgCode}${item.href}`)
                                }
                                className={
                                  active
                                    ? "bg-primary text-white font-medium"
                                    : ""
                                }
                              >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            );
          })}
        </SidebarContent>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <span className="font-medium">Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {user?.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" />
              Logout
            </Button>
          </div>
        </header>

        <main className="p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
