"use client";

import { Building2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div
      onClick={() => router.push(`${pathname}/${org.code}`)}
      className="group relative flex flex-col justify-between bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300 cursor-pointer"
    >
      <div>
        {/* Top row with Active Status and Edit Icon */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              org.is_active
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${org.is_active ? "bg-green-500" : "bg-red-500"}`}></span>
            {org.is_active ? "Active" : "Inactive"}
          </span>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(org);
            }}
          >
            <Pencil className="w-3.5 h-3.5 text-gray-500 hover:text-blue-600" />
          </Button>
        </div>

        {/* Brand Icon and Info */}
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl text-white shadow-sm shadow-blue-100 group-hover:scale-105 transition-transform duration-300">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-1">
              {org.name}
            </h3>
            <p className="text-xs text-gray-500 font-mono tracking-wider uppercase mt-0.5">
              Code: {org.code}
            </p>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-semibold group-hover:text-blue-600 transition-colors duration-200">
        <span>Configure Settings</span>
        <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
          →
        </span>
      </div>
    </div>
  );
}
