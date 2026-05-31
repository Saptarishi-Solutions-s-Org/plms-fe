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
  getReportingManagers,
} from "@/services/organizationAdmin";

interface DeactivateFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;

  selectedUser: {
    id: string;
    name: string;
    role: string;
  };
}

interface UserOption {
  id: string;
  name: string;
}

const DeactivateForm = ({
  isOpen,
  setIsOpen,
  selectedUser,
}: DeactivateFormProps) => {
  const [managers, setManagers] = useState<UserOption[]>([]);

  const [executives, setExecutives] = useState<UserOption[]>([]);

  const [selectedValue, setSelectedValue] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const managersResponse =
          await getReportingManagers();

        const executivesResponse =
          await getAllExecutives();

        setManagers(managersResponse);

        setExecutives(executivesResponse);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  // Auto fill selected user name
  useEffect(() => {
    if (selectedUser?.name) {
      setSelectedValue(selectedUser.name);
    }
  }, [selectedUser]);

  const isExecutive =
    selectedUser?.role?.toLowerCase() ===
    "executive";

  const dropdownData = isExecutive
    ? executives
    : managers;

  const handleDeactivate = () => {// Implement deactivation logic here, using selectedValue to determine which user to deactivate
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Deactivate User
          </DialogTitle>

          <DialogDescription className="flex flex-col gap-4 mt-2">
            {isExecutive
              ? "Select Executive"
              : "Select Manager"}
          </DialogDescription>

          <Select
            value={selectedValue}
            onValueChange={setSelectedValue}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  isExecutive
                    ? "Select Executive"
                    : "Select Manager"
                }
              />
            </SelectTrigger>

            <SelectContent>
              {dropdownData.map((user) => (
                <SelectItem
                  key={user.id}
                  value={user.name}
                >
                  {user.name}
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

          <Button variant="destructive" onClick={() => {handleDeactivate()}}>
            Deactivate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeactivateForm;