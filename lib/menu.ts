import {
  LayoutDashboard,
  Users,
  Building2,
  FileText
} from "lucide-react"

export const MENU_CONFIG = [
  {
    key: "main",
    label: "Main",
    open: true,
    items: [
      {
        href: "/dashboard",
        icon: LayoutDashboard,
        label: "Dashboard",
        module: "dashboard",
        permission: "view"
      }
    ]
  },
  {
    key: "management",
    label: "Management",
    open: true,
    items: [
      {
        href: "/users",
        icon: Users,
        label: "Users",
        module: "users",
        permission: "view"
      },
      {
        href: "/organization",
        icon: Building2,
        label: "Organization",
        module: "organization",
        permission: "view"
      }
    ]
  },
  {
    key: "reports",
    label: "Reports",
    open: true,
    items: [
      {
        href: "/reports",
        icon: FileText,
        label: "Reports",
        module: "reports",
        permission: "view"
      }
    ]
  }
]