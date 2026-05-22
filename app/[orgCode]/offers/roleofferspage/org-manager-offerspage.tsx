"use client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
export default function OrgManagerOffersPage() {  

  return (
    <div className="w-full h-full p-5">
      <div className="w-full h-full flex flex-col">

        {/* Header */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-semibold">
              offers
            </h1>

            <h2 className="text-sm sm:text-base text-gray-600">
              Upload multiple offers at once
            </h2>
          </div>

          {/* Bulk Action Button */}
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto rounded-full bg-blue-500 text-white hover:bg-blue-600 hover:text-white font-medium"
          >
            <Plus className="mr-2 h-4 w-4" />
            Bulk Action
          </Button>

        </div>
 </div>
    </div>
);
}
