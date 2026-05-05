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
        href: "/dashboard/organization",
        icon: Building2,
        label: "Organization",
        modules: ["organization"],
        permissions: ["view"],
        roles: ["Executive", "Manager","Admin"],
      },
      {
        href: "/leads",
        icon: UserCheck,
        label: "Leads",
        modules: ["lead"],
        permissions: ["view"],// U need to update this based on the actual permissions required
        roles: ["Manager","Executive"], // U need to update this based on the actual roles that should have access
      },
      {
        href: "/offers",
        icon: Gift,
        label: "Offers",
        modules: ["offers"],
        permissions: ["view","create","update","delete"],// U need to update this based on the actual permissions required
        roles: ["Admin","Executive"],// U need to update this based on the actual roles that should have access
      },
    ],
  },
];

