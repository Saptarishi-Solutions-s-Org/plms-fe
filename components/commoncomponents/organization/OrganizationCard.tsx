"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, Pencil } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { Organization } from "@/types/organization";

export default function OrganizationCard({
  org,
  onEdit,
}: {
  org: Organization;
  onEdit: (org: Organization) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Card
      onClick={
        () => router.push(`${pathname}/${org.code}`) // 🔥 FIX
      }
      className="cursor-pointer hover:shadow-md transition-all border border-gray-200"
    >
      <CardContent className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-blue-100">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">{org.name}</p>

            <p className="text-xs text-gray-500">{org.code}</p>

            <Badge
              variant={org.is_active ? "default" : "destructive"}
              className="text-[10px] px-2 py-0 mt-1"
            >
              {org.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(org);
          }}
        >
          <Pencil className="w-4 h-4 text-gray-600" />
        </Button>
      </CardContent>
    </Card>
  );
}
