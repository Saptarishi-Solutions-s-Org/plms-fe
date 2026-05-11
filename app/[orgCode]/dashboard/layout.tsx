"use client";

import { ReactNode, useState, useEffect } from "react";
import Image from "next/image";
import { usePathname, useRouter, useParams } from "next/navigation";

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
  useSidebar,
} from "@/components/ui/sidebar";

import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Home,
  User,
  type LucideIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoutConfirmationDialog } from "@/components/commoncomponents/logout-confirmation-dialog";

import { MENU_CONFIG } from "@/lib/menu";
import { canAccess } from "@/lib/permissions";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import {
  AuthUser,
  getDashboardPath,
  logoutSession,
  refreshSession,
} from "@/lib/auth";

const DASHBOARD_QUOTES = [
  "Consistency beats motivation",
  "Small steps every day",
  "Stay focused, stay sharp",
];

function getRandomQuote() {
  return DASHBOARD_QUOTES[Math.floor(Math.random() * DASHBOARD_QUOTES.length)];
}

function SidebarBrand() {
  const { open } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="flex justify-center">
          {open ? (
            <Image
              src="/saptarishi.png"
              alt="Logo"
              width={100}
              height={40}
              priority
              style={{ width: "auto", height: "auto" }}
            />
          ) : (
            <Image src="/sap.png" alt="Logo" width={32} height={32} priority />
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

type SidebarLinkProps = {
  href: string;
  icon: LucideIcon;
  label: string;
  pathname: string;
  orgCode: string;
};

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  pathname,
  orgCode,
}: SidebarLinkProps) => {
  const router = useRouter();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={() => router.push(`/${orgCode}${href}`)}
        className={
          pathname === `/${orgCode}${href}`
            ? "bg-gray-100 text-primary font-medium"
            : ""
        }
      >
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export default function Layout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [state, setState] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState(() => getRandomQuote());

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ orgCode: string }>();
  const orgCode = params.orgCode;

  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    refreshSession().then((session) => {
      if (cancelled) return;

      if (!session) {
        router.replace("/");
        return;
      }

      if (session.user.orgCode !== orgCode) {
        router.replace(getDashboardPath(session.user));
        return;
      }

      setUser(session.user);
      connectSocket(session.accessToken);

      const initial: Record<string, boolean> = {};
      MENU_CONFIG.forEach((g) => (initial[g.key] = g.open));
      setState(initial);

      setLoading(false);
    });

    return () => {
      cancelled = true;
      disconnectSocket();
    };
  }, [orgCode, router]);

  useEffect(() => {
    const i = setInterval(() => setQuote(getRandomQuote()), 5000);
    return () => clearInterval(i);
  }, []);

  const toggle = (key: string) => {
    setState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    await logoutSession();
    router.replace("/");
  };

  if (loading) return null;

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="bg-white border-r">
        <SidebarHeader className="bg-white">
          <SidebarBrand />
        </SidebarHeader>

        <SidebarContent className="bg-white">
          {MENU_CONFIG.map((group) => {
            const items = group.items.filter((item) =>
              "public" in item
                ? true
                : canAccess(
                  user,
                  item.modules ?? [],
                  item.permissions ?? [],
                  item
                ),
            );

            if (!items.length) return null;

            return (
              <Collapsible
                key={group.key}
                open={state[group.key]}
                onOpenChange={() => toggle(group.key)}
              >
                <SidebarGroup className="border-t">
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="flex items-center justify-between cursor-pointer">
                      {group.label}
                      {state[group.key] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {items.map((item) => (
                          <SidebarLink
                            key={item.href}
                            {...item}
                            pathname={pathname}
                            orgCode={orgCode}
                          />
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            );
          })}
        </SidebarContent>
      </Sidebar>

      <SidebarInset className="min-w-0 h-screen flex flex-col overflow-hidden">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-white px-3 sm:px-4 gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <SidebarTrigger />
            <h1 className="text-xs sm:text-sm md:text-base font-semibold text-gray-700 truncate max-w-[70vw]">
              <span className="block sm:hidden">PLMS</span>
              <span className="hidden sm:block">{quote}</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Home
              className="h-5 w-5 text-blue-700 cursor-pointer"
              onClick={() => router.push("/")}
            />

            <div className="w-[0.1px] h-5 bg-gray-300" />

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded-md transition">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>
                        {user.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="hidden sm:block leading-tight">
                      <p className="text-xs font-semibold truncate max-w-[140px]">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                        {user.role}
                      </p>
                    </div>
                  </div>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-40 p-1">
                  <DropdownMenuItem
                    onClick={() => router.push(`/${orgCode}/profile`)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setLogoutOpen(true)}
                    className="text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto min-w-0">
          {user && children}
        </main>
      </SidebarInset>

      <LogoutConfirmationDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </SidebarProvider>
  );
}
