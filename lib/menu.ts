import { LayoutDashboard, Building2, UserCheck, Gift } from "lucide-react";

import { MenuGroup } from "@/types/menu";

export const MENU_CONFIG: MenuGroup[] = [
  {
    key: "main",
    label: "Main",
    open: true,
    items: [
      {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        public: true,
      },
    ],
  },
  {
    key: "core",
    label: "Core",
    open: true,
    items: [
      {
        href: "/organization",
        icon: Building2,
        label: "Organization",
        module: "organization",
        permission: "view",
      },
      {
        href: "/leads",
        icon: UserCheck,
        label: "Leads",
        module: "lead",
        permission: "view",
      },
      {
        href: "/offers",
        icon: Gift,
        label: "Offers",
        module: "offers",
        permission: "view",
      },
    ],
  },
];
