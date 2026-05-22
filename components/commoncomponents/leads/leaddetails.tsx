"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { getCountries, getStatesByCountry } from "@/services/location";
import { Lead } from "@/types/leadtypes";

function FieldDisplay({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-normal text-gray-700">{label}</Label>
      <div
        className={`w-full rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-900 ${
          multiline
            ? "min-h-[100px] py-2 whitespace-pre-wrap"
            : "flex h-10 items-center"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

export default function LeadDetails({ lead }: { lead: Lead }) {
  const [countryName, setCountryName] = useState(lead.country);
  const [stateName, setStateName] = useState(lead.state);

  useEffect(() => {
    const loadLocationNames = async () => {
      try {
        const countries = await getCountries();
        const country = countries.find(
          (item: { id: string; name: string }) => item.id === lead.country,
        );

        setCountryName(country?.name ?? lead.country);

        if (!lead.country) {
          setStateName(lead.state);
          return;
        }

        const states = await getStatesByCountry(lead.country);
        const state = states.find(
          (item: { id: string; name: string }) => item.id === lead.state,
        );

        setStateName(state?.name ?? lead.state);
      } catch (error) {
        console.error(error);
        setCountryName(lead.country);
        setStateName(lead.state);
      }
    };

    loadLocationNames();
  }, [lead.country, lead.state]);

  return (
    <div className="flex flex-col gap-5 py-2">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-blue-600">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldDisplay label="Lead Code" value={lead.leadCode} />
          <FieldDisplay label="Name" value={lead.name} />
          <FieldDisplay label="Gender" value={lead.gender} />
          <FieldDisplay label="Email" value={lead.email} />
          <FieldDisplay label="Phone Number" value={lead.phone} />            
          <FieldDisplay label="Country" value={countryName} />        
          <FieldDisplay label="State" value={stateName} />
          <FieldDisplay label="City" value={lead.city} />
          <FieldDisplay label="Postal Code" value={lead.postalCode} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-blue-600">
          Lead Classification
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FieldDisplay label="Status" value={lead.status} />
          <FieldDisplay
            label="Assigned To"
            value={lead.assignedToName ?? "Unassigned"}
          />
          <FieldDisplay label="Priority" value={lead.priority} />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-blue-600">
          Additional Information
        </h3>
        <FieldDisplay label="Notes" value={lead.notes} multiline />
      </div>
    </div>
  );
}
