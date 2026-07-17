import type { LeadActivity } from "@/types/leadtypes";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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

function formatActivityType(type?: string) {
  return type?.replace(/_/g, " ");
}

export default function ActivityTimeline({
  activities,
  canEdit = false,
  onEdit,
}: {
  activities: LeadActivity[];
  canEdit?: boolean;
  onEdit?: (id: string, newNotes: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = (act: LeadActivity) => {
    setEditingId(act.id);
    setEditNotes(act.notes);
  };

  const handleSave = async (id: string) => {
    if (!onEdit) return;
    setIsSaving(true);
    try {
      await onEdit(id, editNotes);
      setEditingId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };
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
              <div className="my-1 w-px flex-1 bg-gray-300" />
            )}
          </div>

          <div className="min-w-0 flex-1 pb-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-gray-900">
                  {act.createdByName}
                </p>
                <Badge
                  variant="outline"
                  className="border-blue-200 bg-blue-50 text-xs font-medium text-blue-700"
                >
                  {formatActivityType(act.type)}
                </Badge>
              </div>
              {canEdit && editingId !== act.id && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-blue-600"
                  onClick={() => handleEditClick(act)}
                  title="Edit Note"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <p className="mb-1 text-xs text-gray-400">
              {timeAgo(act.createdAt)}
            </p>
            {editingId === act.id ? (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="min-h-[80px] w-full text-sm"
                  disabled={isSaving}
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-7 text-xs bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => handleSave(act.id)}
                    disabled={isSaving || !editNotes.trim()}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs text-gray-500 hover:text-gray-700"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : act.notes.length > NOTE_PREVIEW_LIMIT ? (
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
