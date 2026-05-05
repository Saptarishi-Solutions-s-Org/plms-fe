"use client";

import { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

type Lead = {
  id: number;
  name: string;
  leads: number;
  conversion: string;
};

const leads: Lead[] = [
  { id: 1, name: "Sarah Jenkins", leads: 42, conversion: "24.5%" },
  { id: 2, name: "Robert Chen", leads: 38, conversion: "19.2%" },
  { id: 3, name: "Linda Vogt", leads: 51, conversion: "15.8%" },
  { id: 4, name: "James Wilson", leads: 29, conversion: "21.4%" },
];

export function AssignLeadsTable() {
  const [selectedExecutives, setSelectedExecutives] = useState<number[]>([]);

  const toggleExecutive = (id: number) => {
    setSelectedExecutives((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">

      <Table>

        <TableHeader className="bg-[#7677F41A]">
          <TableRow>
            <TableHead className="w-[60px]">Select</TableHead>
            <TableHead>Executive Name</TableHead>
            <TableHead>Leads</TableHead>
            <TableHead>Conv. Rate</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-gray-50">

              <TableCell>
                <Checkbox
                  checked={selectedExecutives.includes(lead.id)}
                  onCheckedChange={() => toggleExecutive(lead.id)}
                />
              </TableCell>

              <TableCell className="font-medium text-gray-900">
                {lead.name}
              </TableCell>

              <TableCell className="text-gray-600">
                {lead.leads}
              </TableCell>

              <TableCell
                className={`font-semibold ${
                  lead.conversion === "15.8%"
                    ? "text-red-500"
                    : "text-blue-600"
                }`}
              >
                {lead.conversion}
              </TableCell>

            </TableRow>
          ))}
        </TableBody>

      </Table>

    </div>
  );
}