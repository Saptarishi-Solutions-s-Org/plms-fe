import type { LeadDetailData } from "@/types/leadtypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {LeadContactCardProps} from "@/types/leadActivity";


export default function LeadContactCard({ lead }: LeadContactCardProps) {
  return (
    <Card className="gap-0 border-gray-200 py-0 shadow-none">
      <CardHeader className="border-b border-gray-100 px-5 py-4">
        <CardTitle className="text-sm text-gray-800">
          Contact Details
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 py-1">
        <div className="flex flex-col gap-1 pt-1">
          <div className="border-b border-gray-100 py-2.5">
            <p className="text-sm text-gray-400">
              Phone
            </p>
            <p className="text-sm font-medium text-gray-900">
              {lead.phone || "-"}
            </p>
          </div>

          <div className="border-b border-gray-100 py-2.5">
            <p className="text-sm text-gray-400">
              Email
            </p>
            <p className="text-sm font-medium text-gray-900">
              {lead.email || "-"}
            </p>
          </div>

          <div className="py-2.5">
            <p className="text-sm text-gray-400">
              Location
            </p>
            <p className="text-sm font-medium text-gray-900">
              {[lead.city, lead.stateName, lead.countryName]
                .filter(Boolean)
                .join(", ") || "-"}
            </p>
            {lead.postalCode && (
              <p className="text-sm text-gray-400">{lead.postalCode}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
