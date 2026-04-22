import AdminCards from "@/components/orgadmindashboard/cards";
import AdminFilters from "@/components/orgadmindashboard/filters";
import UserTable from "@/components/orgadmindashboard/userstable";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import AddLeadForm from "@/components/orgadmindashboard/userform";
import { getOrganizationAdminDashboard } from "@/services/organizationAdmin";
import { AdminCardsProps, UserDetails } from "@/types/organizationadmindashboard/dashboardtypes";


export default function OrganizationAdminDashboard() {


  const [openLeadForm, setOpenLeadForm] = useState(false);

  const [userdata, setuserdata] = useState<UserDetails[]>([]);
  const [stats, setStats] = useState<AdminCardsProps["stats"]>({
    total_users: 0,
    active_users: 0,
    inactive_users: 0,
  });
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getOrganizationAdminDashboard();

        setuserdata(data.users);
        setStats({
          total_users: data.stats.total_users,
          active_users: data.stats.active_users,
          inactive_users: data.stats.inactive_users,
        });

      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="w-full h-full p-5 ">

      <div className="w-full h-full flex flex-col">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 h-auto sm:h-20">

          {/* Heading Section */}
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-semibold">
              Admin Dashboard
            </h1>
            <h2 className="text-sm sm:text-base font-normal text-gray-600">
              Manage system users, their roles and account statuses
            </h2>
          </div>

          {/* Button + Dialog */}
          <Dialog open={openLeadForm} onOpenChange={setOpenLeadForm}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-full bg-blue-500 text-white hover:bg-blue-600 hover:text-white font-medium"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>

            <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add User</DialogTitle>
                <DialogDescription>
                  Fill the form to create a New User.
                </DialogDescription>
              </DialogHeader>

              <AddLeadForm />
            </DialogContent>
          </Dialog>

        </div>

         <div className="mt-5">
        <AdminCards stats={stats} />
      </div>

      <div className="mt-10">
        <div className="flex">
          <AdminFilters />
        </div>

      </div>


      <div className="mt-10">
        <UserTable users={userdata} />
      </div>
      </div>
     
    </div>
  )
}