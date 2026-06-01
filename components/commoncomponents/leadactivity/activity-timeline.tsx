import type { LeadActivity } from "@/types/leadtypes";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NOTE_PREVIEW_LIMIT = 40;

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ActivityTimeline({
  activities,
}: {
  activities: LeadActivity[];
}) {
  if (activities.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        No activities yet
      </p>
    );
  }

  return (
    <div className="space-y-0 px-5 pb-5 pt-2">
      {activities.map((act, idx) => (
        <div key={act.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={`mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${
                idx === 0
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-300 bg-gray-200"
              }`}
            />
            {idx < activities.length - 1 && (
              <div className="my-1 w-px flex-1 bg-gray-200" />
            )}
          </div>

          <div className="min-w-0 flex-1 pb-5">
            <p className="text-sm font-medium text-gray-900">
              {act.createdByName}
            </p>
            <p className="mb-1 text-xs text-gray-400">
              {timeAgo(act.createdAt)}
            </p>
            {act.notes.length > NOTE_PREVIEW_LIMIT ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <p>
                    {act.notes.slice(0, NOTE_PREVIEW_LIMIT)}...
                  </p>
                </TooltipTrigger>
                <TooltipContent className="max-w-[280px] whitespace-normal break-all">
                  {act.notes}
                </TooltipContent>
              </Tooltip>
            ) : (
              <p>
                {act.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
