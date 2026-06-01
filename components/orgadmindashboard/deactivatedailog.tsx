import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

import { Button } from "../ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { useEffect, useState } from "react";

import {
  getAllExecutives,
  getManagersForReassign,
  deactivateManager,
  deactivateExecutive,
  activateUser,
} from "@/services/organizationAdmin";

interface DeactivateFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  mode: "activate" | "deactivate";

  selectedUser: {
    id: string;
    name: string;
    role: string;
  };
  onSuccess?: () => void;
}

interface UserOption {
  id: string;
  name: string;
}

const DeactivateForm = ({
  isOpen,
  setIsOpen,
  mode,
  selectedUser,
  onSuccess,
}: DeactivateFormProps) => {
  const [managers, setManagers] = useState<UserOption[]>([]);
  const [executives, setExecutives] = useState<UserOption[]>([]);
  const [selectedManagerId, setSelectedManagerId] =
    useState("");
  const [selectedExecutiveId, setSelectedExecutiveId] =
    useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isExecutive =
    selectedUser?.role?.toLowerCase() === "executive";
  const isActivate = mode === "activate";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        if (isExecutive) {
          const executivesResponse = await getAllExecutives();
          setExecutives(executivesResponse);
        } else if (selectedUser.id) {
          const managersResponse =
            await getManagersForReassign(selectedUser.id);
          setManagers(managersResponse);
        }
      } catch (err) {
        setError("Failed to fetch managers/executives");
        console.error(err);
      }
    };

    if (isOpen) {
      if (!isActivate) {
        fetchData();
      }
      setSelectedManagerId("");
      setSelectedExecutiveId("");
    }
  }, [isOpen, isActivate, isExecutive, selectedUser.id]);

  const handleDeactivate = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isActivate) {
        await activateUser(selectedUser.id);
      } else {
        if (isExecutive) {
          // Deactivate executive and reassign leads
          if (!selectedExecutiveId) {
            setError(
              "Please select an executive to reassign leads"
            );
            setIsLoading(false);
            return;
          }

          await deactivateExecutive(
            selectedUser.id,
            selectedExecutiveId
          );
        } else {
          // Deactivate manager and reassign executives
          if (!selectedManagerId) {
            setError(
              "Please select a manager to reassign executives"
            );
            setIsLoading(false);
            return;
          }

          await deactivateManager(
            selectedUser.id,
            selectedManagerId
          );
        }
      }

      // Success - close dialog and refresh
      setIsOpen(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isActivate
          ? "Failed to activate user"
          : "Failed to deactivate user"
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isActivate ? "Activate" : "Deactivate"} {isExecutive ? "Executive" : "Manager"}
          </DialogTitle>
          <DialogDescription className={isActivate ? "mt-4" : "flex flex-col gap-4 mt-4"}>
            <div>
              <div className="font-medium text-gray-700 mb-2">
                {isActivate
                  ? `Are you sure you want to activate ${selectedUser.name}?`
                  : isExecutive
                  ? "Select an Executive to reassign leads"
                  : "Please select a Manager to reassign executives"}
              </div>
              <div className="text-sm text-gray-500">
                {isActivate ? (
                  <>This will restore the selected {isExecutive ? "executive" : "manager"} to active status.</>
                ) : (
                  <>
                    All {isExecutive ? "leads" : "executives"} from{" "}
                    <span className="font-semibold">
                      {selectedUser.name}
                    </span>{" "}
                    will be reassigned to the selected {isExecutive ? "executive" : "manager"}.
                  </>
                )}
              </div>
            </div>

            {!isActivate && !isExecutive && managers.filter((m) => m.id !== selectedUser.id).length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Manager
                </label>
                <Select
                  value={selectedManagerId}
                  onValueChange={setSelectedManagerId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder="Select a Manager"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {managers
                      .filter(
                        (m) => m.id !== selectedUser.id
                      )
                      .map((user) => (
                        <SelectItem
                          key={user.id}
                          value={user.id}
                        >
                          {user.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isActivate && !isExecutive && managers.filter((m) => m.id !== selectedUser.id).length === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  No active managers available for reassignment. Please activate another manager first before deactivating this one.
                </p>
              </div>
            )}

            {!isActivate && isExecutive && executives.filter((e) => e.id !== selectedUser.id).length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Select Executive
                </label>
                <Select
                  value={selectedExecutiveId}
                  onValueChange={setSelectedExecutiveId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder="Select an Executive"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {executives
                      .filter(
                        (e) => e.id !== selectedUser.id
                      )
                      .map((user) => (
                        <SelectItem
                          key={user.id}
                          value={user.id}
                        >
                          {user.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isActivate && isExecutive && executives.filter((e) => e.id !== selectedUser.id).length === 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  No active executives available for reassignment. Please activate another executive first before deactivating this one.
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            variant={isActivate ? "default" : "destructive"}
            onClick={handleDeactivate}
            disabled={isLoading || (!isActivate && ((!isExecutive && managers.filter((m) => m.id !== selectedUser.id).length === 0) || (isExecutive && executives.filter((e) => e.id !== selectedUser.id).length === 0)))}
          >
            {isLoading
              ? isActivate
                ? "Activating..."
                : "Deactivating..."
              : isActivate
              ? "Activate"
              : "Deactivate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeactivateForm;