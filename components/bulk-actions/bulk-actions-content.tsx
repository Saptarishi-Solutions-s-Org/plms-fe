"use client";

import { AssignLeadsTable } from "./assign-leads-table";
import { AssignOffersTable } from "./assign-offers-table";

export function BulkActionsContent() {
  return (
    <div className="grid grid-cols-2 gap-6">

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-600">
          Assign Leads
        </h3>

        <AssignLeadsTable />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-blue-600">
          Assign Offers
        </h3>

        <AssignOffersTable />
      </div>

    </div>
  );
}