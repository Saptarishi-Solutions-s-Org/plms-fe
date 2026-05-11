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



const UserTable = ({ users, loading }: { users: UserDetails[]; loading: boolean }) => {

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
                    </TableRow>
                </TableHeader>

                <TableBody>

                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-6">
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : users.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                                No records found
                            </TableCell>
                        </TableRow>
                    ) : (
                        users.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.email || "-"}</TableCell>
                                <TableCell>{item.role_name}</TableCell>
                                <TableCell>
                                    {item.is_active ? "Active" : "Inactive"}
                                </TableCell>
                            </TableRow>
                        ))
                    )}

                </TableBody>
            </Table>
        </div>
    )
}

export default UserTable
