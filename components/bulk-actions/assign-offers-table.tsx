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

type Offer = {
  id: number;
  name: string;
  validity: string;
  status: string;
};

const offers: Offer[] = [
  { id: 1, name: "Q3 Retention", validity: "Oct 31, 2023", status: "ACTIVE" },
  { id: 2, name: "Early Bird Ent.", validity: "Dec 15, 2023", status: "ACTIVE" },
  { id: 3, name: "Market Entry", validity: "Expired", status: "INACTIVE" },
  { id: 4, name: "Holiday Special", validity: "Jan 01, 2024", status: "ACTIVE" },
];

export function AssignOffersTable() {
  const [selectedOffers, setSelectedOffers] = useState<number[]>([]);

  const toggleOffer = (id: number) => {
    setSelectedOffers((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="border rounded-xl overflow-hidden">

      <Table>

        <TableHeader className="bg-[#7677F41A]">
          <TableRow>
            <TableHead className="w-[60px]">Select</TableHead>
            <TableHead>Offer</TableHead>
            <TableHead>Validity</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {offers.map((offer) => (
            <TableRow
              key={offer.id}
              data-state={
                selectedOffers.includes(offer.id) ? "selected" : undefined
              }
            >
              <TableCell>
                <Checkbox
                  checked={selectedOffers.includes(offer.id)}
                  onCheckedChange={() => toggleOffer(offer.id)}
                />
              </TableCell>

              <TableCell className="font-medium">
                {offer.name}
              </TableCell>

              <TableCell>
                {offer.validity}
              </TableCell>

              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    offer.status === "ACTIVE"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {offer.status}
                </span>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>

      </Table>

    </div>
  );
}