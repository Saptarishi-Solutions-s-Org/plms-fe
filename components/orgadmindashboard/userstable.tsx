import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
}
    from "@/components/ui/table"
import { UserDetails } from "@/types/organizationadmindashboard/dashboardtypes"
import { Button } from "../ui/button";
import { MoreHorizontal } from "lucide-react";
import DeactivateForm from "./deactivatedailog";
import EditUserDialog from "./edit-user-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useState } from "react";

const actionModes = {
  activate: "activate",
  deactivate: "deactivate",
} as const;

type ActionMode = (typeof actionModes)[keyof typeof actionModes]

const UserTable = ({ 
  users, 
  loading,
  onRefresh,
  rowOffset
}: { 
  users: UserDetails[]; 
  loading: boolean;
  onRefresh?: () => void;
  rowOffset?: number;
}) => {

    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserDetails | null>(null);
    const [selectedMode, setSelectedMode] = useState<ActionMode>(actionModes.deactivate);
    const [selectedUser, setSelectedUser] = useState({
        id: "",
        name: "",
        role: "",
    });
    return (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto">
            <Table>
                <TableHeader className="bg-[#7677F41A] border-b border-gray-200">
                    <TableRow>
                        <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                            S.No
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                            Name
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                            Email
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                            Role
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                            Status
                        </TableHead>
                        <TableHead className="text-xs sm:text-sm whitespace-nowrap">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>

                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                                No records found
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell>{(rowOffset ?? 0) + index + 1}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.email || "-"}</TableCell>
                                <TableCell>{item.role_name}</TableCell>
                                <TableCell>
                                    {item.is_active ? "Active" : "Inactive"}
                                </TableCell>
                                <TableCell className="text-left">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal />
                                            </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setEditingUser(item);
                                                    setIsEditOpen(true);
                                                }}
                                            >
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setSelectedUser({
                                                        id: item.id,
                                                        name: item.name,
                                                        role: item.role_name,
                                                    });
                                                    setSelectedMode(
                                                        item.is_active
                                                            ? actionModes.deactivate
                                                            : actionModes.activate
                                                    );
                                                    setIsDeactivateOpen(true);
                                                }}
                                            >
                                                {item.is_active ? "Deactivate" : "Activate"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}

                </TableBody>
            </Table>
            <DeactivateForm
                isOpen={isDeactivateOpen}
                setIsOpen={setIsDeactivateOpen}
                mode={selectedMode}
                selectedUser={selectedUser}
                onSuccess={onRefresh}
            />
            <EditUserDialog
                open={isEditOpen}
                onOpenChange={(open) => {
                    setIsEditOpen(open);
                    if (!open) setEditingUser(null);
                }}
                user={editingUser}
                onSuccess={onRefresh}
            />
        </div>

    )
}

export default UserTable
