"use client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { LeadFormData } from "@/types/organizationadmindashboard/dashboardtypes";
import { useForm } from "react-hook-form";
import { userFormSchema } from "@/lib/validators/admin/userform";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { getCountries, getStatesByCountry } from "@/services/location";
import { createOrganizationUser, getReportingManagers } from "@/services/organizationAdmin";
import { toast } from "sonner";

const GenderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
];

const RoleOptions = [
    { value: "Manager", label: "Manager" },
    { value: "Executive", label: "Executive" },
];

const AddLeadForm = ({ onClose }: { onClose?: () => void }) => {

    const [countries, setCountries] = useState<any[]>([]);
    const [states, setStates] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        control,
        watch,
        setValue,
    } = useForm<LeadFormData>({
        resolver: zodResolver(userFormSchema as any),
        defaultValues: {
            name: "",
            dob: new Date(),
            email: "",
            phone: "",
            gender: "",
            country: "",
            state: "",
            city: "",
            userRole: "",
            reportingManager: "",
        },
    });

    const selectedCountry = watch("country");
    const selectedRole = watch("userRole");

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                if (countries.length === 0) {
                    const countryData = await getCountries();
                    if (isMounted) setCountries(countryData);
                }

                if (selectedCountry) {
                    const stateData = await getStatesByCountry(selectedCountry);
                    if (isMounted) setStates(stateData);
                } else {
                    if (isMounted) {
                        setStates([]);
                        setValue("state", "");
                    }
                }

                if (selectedRole === "Executive") {
                    const managerData = await getReportingManagers();
                    if (isMounted) setManagers(managerData);
                } else {
                    if (isMounted) {
                        setManagers([]);
                        setValue("reportingManager", "");
                    }
                }

            } catch (err) {
                console.error("Error in combined fetch:", err);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [selectedCountry, selectedRole, setValue]);

    const onSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);

            const payload = {
                name: data.name,
                email: data.email,
                phone: data.phone,
                gender: data.gender,
                dob: data.dob,
                state: data.state,
                country: data.country,
                city: data.city,
                roleName:
                    data.userRole === "Manager"
                        ? "Manager"
                        : "Executive",
                reportingManager: data.reportingManager || null,
            };

            await createOrganizationUser(payload);
            toast.success("User created successfully!");
            reset();

            if (onClose) onClose();

        } catch (err) {
            toast.error("Failed to create user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full overflow-y-auto p-1 scroll-smooth">
            <form onSubmit={handleSubmit(onSubmit)} className="w-full h-full" >

                {/* YOUR FULL FORM UI (UNCHANGED) */}
                      <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-bold text-blue-600">
                        Personal Details
                    </h2>

                    <div className="flex flex-col gap-2">
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-1 w-full">
                                <Label htmlFor="firstName" required>
                                    First Name
                                </Label>
                                <Input id="firstName" type="text" {...register("name")} placeholder="Enter Name" className={`border-2 ${errors.name ? "border-red-500" : "border-gray-300"}`} />
                                <span className="text-sm text-red-500 ">{errors.name?.message}</span>
                            </div>
                        </div>

                        <div className="flex  w-full gap-4">
                            <div className="flex flex-col gap-1 w-full">
                                <Label htmlFor="date" required>
                                    Date
                                </Label>
                                <Input id="date" type="date"  {...register("dob")} className={`border-2 ${errors.dob ? "border-red-500" : "border-gray-300"}`} />
                                <span className="text-sm text-red-500 ">{errors.dob?.message}</span>
                            </div>

                            <div className="flex flex-col gap-1 w-full">
                                <Label htmlFor="gender" required>
                                    Gender
                                </Label>
                                <Controller
                                    name="gender"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}  >
                                            <SelectTrigger className={`w-full border-2 ${errors.gender ? "border-red-500" : "border-gray-300"}`} >
                                                <SelectValue placeholder="Select gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {GenderOptions.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <span className="text-sm text-red-500 ">{errors.gender?.message}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ACCOUNT & LOCATION */}
                <div className="flex flex-col gap-4 mt-3">
                    <h2 className="text-lg font-bold text-blue-600">
                        Account & Location
                    </h2>

                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-1 w-full">
                                <Label htmlFor="email" required>
                                    Email
                                </Label>
                                <Input id="email" type="email" placeholder="Enter email"  {...register("email")} className={`border-2 ${errors.email ? "border-red-500" : "border-gray-300"}`} />
                                <span className="text-sm text-red-500 ">{errors.email?.message}</span>
                            </div>

                            <div className="flex flex-col gap-1 w-full">
                                <Label htmlFor="phone" required>
                                    Phone Number
                                </Label>
                                <Input id="phone" type="text" placeholder="Enter phone number" {...register("phone")} className={`border-2 ${errors.phone ? "border-red-500" : "border-gray-300"
                                    }`} />
                                <span className="text-sm text-red-500 ">{errors.phone?.message}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex flex-col gap-1 w-full">
                                <Label htmlFor="country" required>
                                    Country
                                </Label>
                                <Controller
                                    name="country"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}  >
                                            <SelectTrigger className={`w-full border-2 ${errors.country ? "border-red-500" : "border-gray-300"}`} >
                                                <SelectValue placeholder="Select country" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {countries.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <span className="text-sm text-red-500 ">{errors.country?.message}</span>
                            </div>

                            <div className="flex flex-col gap-1 w-full">
                                <Label htmlFor="state" required>
                                    State
                                </Label>
                                <Controller
                                    name="state"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={!selectedCountry}
                                        >
                                            <SelectTrigger className={`w-full border-2 ${errors.state ? "border-red-500" : "border-gray-300"} `} >
                                                <SelectValue placeholder={
                                                    selectedCountry ? "Select state" : "Select country first"
                                                } />
                                            </SelectTrigger>
                                            <SelectContent className="w-full  max-h-60 overflow-y-auto">
                                                {states.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <span className="text-sm text-red-500 ">{errors.state?.message}</span>
                            </div>
                        </div>

                        <div className="flex w-full gap-4">
                            <div className="flex flex-col gap-1 w-full">
                                <Label htmlFor="city" required>
                                    City
                                </Label>
                                <Input id="city" type="text" placeholder="Enter city" {...register("city")} className={`border-2 ${errors.city ? "border-red-500" : "border-gray-300"}`} />
                                <span className="text-sm text-red-500 ">{errors.city?.message}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ROLE SECTION */}
                <div className="flex flex-col gap-4 mt-3">
                    <h2 className="text-lg font-bold text-blue-600">
                        Role & Status
                    </h2>

                    <div className="flex flex-col gap-4">
                        <div className="flex gap-4">
                            <div className="flex flex-col gap-1 w-full">
                                <Label htmlFor="userRole" required>
                                    User Role
                                </Label>
                                <Controller
                                    name="userRole"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}  >
                                            <SelectTrigger className={`w-full border-2 ${errors.userRole ? "border-red-500" : "border-gray-300"}`}>
                                                <SelectValue placeholder="Select user role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {
                                                    RoleOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))
                                                }
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <span className="text-sm text-red-500 ">{errors.userRole?.message}</span>
                            </div>

                            <div className="flex flex-col gap-1 w-full">
                                <Label htmlFor="reportingManager" required>
                                    Reporting Manager
                                </Label>
                                <Controller
                                    name="reportingManager"
                                    control={control}
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}  >
                                            <SelectTrigger
                                                disabled={selectedRole !== "Executive"}
                                                className={`w-full border-2 ${errors.reportingManager ? "border-red-500" : "border-gray-300"
                                                    }`}
                                            >
                                                <SelectValue placeholder="Select manager" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {managers.map((m) => (
                                                    <SelectItem key={m.id} value={m.id}>
                                                        {m.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                <span className="text-sm text-red-500 ">{errors.reportingManager?.message}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUBMIT */}
                <div className="mt-3">
                    <Button
                        type="submit"
                        disabled={isSubmitting} 
                        className="bg-blue-500 hover:bg-blue-600 text-white w-full"
                    >
                        {isSubmitting ? "Submitting..." : "Submit"} 
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddLeadForm;
          