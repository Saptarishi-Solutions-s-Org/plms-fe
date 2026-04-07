import { LucideIcon } from "lucide-react"

export type PublicMenuItem = {
  href: string
  icon: LucideIcon
  label: string
  public: true
}

export type ProtectedMenuItem = {
  href: string
  icon: LucideIcon
  label: string
  module: string
  permission: string
}

export type MenuItem = PublicMenuItem | ProtectedMenuItem

export type MenuGroup = {
  key: string
  label: string
  open: boolean
  items: MenuItem[]
}