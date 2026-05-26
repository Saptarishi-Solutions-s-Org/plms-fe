import {
  LayoutDashboard,
  Building2,
  UserCheck,
  Gift,
} from "lucide-react";

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
        roles: ["System Admin"],
      },

      {
        href: "/leads",
        icon: UserCheck,
        label: "Leads",
        modules: ["lead"],
        permissions: [
          "view",
          "create",
          "update",
          "delete",
        ],
        roles: [
          "Admin",
          "Executive",
          "Manager",
        ],
      },

      {
        href: "/org-reports",
        icon: UserCheck,
        label: "Reports",
        modules: ["lead"],
        permissions: [
          "view",
          "create",
          "update",
          "delete",
        ],
        roles: [
          "Manager",
        ],
      },


      // Admin → Full access
      {
        href: "/offers",
        icon: Gift,
        label: "Offers",
        modules: ["offers"],
        permissions: [
          "view",
          "create",
          "update",
          "delete",
        ],
        roles: ["Admin"],
      },

      // Manager → View only
      {
        href: "/offers",
        icon: Gift,
        label: "Offers",
        modules: ["offers"],
        permissions: ["view"],
        roles: ["Manager"],
      },
    ],
  },
];