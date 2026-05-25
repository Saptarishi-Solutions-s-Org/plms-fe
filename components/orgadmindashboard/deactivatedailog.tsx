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

import { getReportingManagers } from "@/services/organizationAdmin";

interface DeactivateFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface Manager {
  id: string;
  name: string;
}

const DeactivateForm = ({
  isOpen,
  setIsOpen,
}: DeactivateFormProps) => {
  const [managers, setManagers] = useState<Manager[]>([]);

  const [selectedManager, setSelectedManager] = useState("");

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await getReportingManagers();

        setManagers(response);

        if (response.length > 0) {
          setSelectedManager(response[0].id);
        }
      } catch (error) {
        console.error("Error fetching managers:", error);
      }
    };

    fetchManagers();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Deactivate User</DialogTitle>

          <DialogDescription className="flex flex-col gap-4 mt-2">
            Select reporting manager
          </DialogDescription>

          <Select
            value={selectedManager}
            onValueChange={setSelectedManager}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Manager" />
            </SelectTrigger>

            <SelectContent>
              {managers.map((manager) => (
                <SelectItem
                  key={manager.id}
                  value={manager.id}
                >
                  {manager.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </DialogHeader>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>

          <Button variant="destructive">
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeactivateForm;