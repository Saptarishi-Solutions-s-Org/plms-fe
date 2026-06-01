import { Card, CardContent } from "@/components/ui/card";
import {LeadContactCardProps} from "@/types/leadActivity";


export default function LeadContactCard({ lead }: LeadContactCardProps) {
  return (
    <Card className="gap-0 border-gray-200 py-0 shadow-none">
      <div className="border-b border-gray-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-gray-800">Contact Details</h2>
      </div>
      <CardContent className="px-4 py-1">
        <div className="flex flex-col">
          <div className="border-b border-gray-100 py-2">
            <p className="text-xs text-gray-400">
              Phone
            </p>
            <p className="text-sm font-medium text-gray-900">
              {lead.phone || "-"}
            </p>
          </div>

          <div className="border-b border-gray-100 py-2">
            <p className="text-xs text-gray-400">
              Email
            </p>
            <p className="text-sm font-medium text-gray-900">
              {lead.email || "-"}
            </p>
          </div>

          <div className="py-2">
            <p className="text-xs text-gray-400">
              Location
            </p>
            <p className="text-sm font-medium text-gray-900">
              {[lead.city, lead.stateName, lead.countryName, lead.postalCode]
                .filter(Boolean)
                .join(", ") || "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
