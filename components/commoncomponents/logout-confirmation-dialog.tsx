"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { LogoutConfirmationDialogProps } from "@/types/dialog-types";

export function LogoutConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[250px] max-w-[90vw] bg-white rounded-3xl border-0 shadow-xl p-4">
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center">
            <Image
              src="/samricha.png"
              alt="Logo"
              width={100}
              height={100}
              priority
              className="object-contain"
              style={{ width: "auto", height: "auto" }}
            />
          </div>
          <AlertDialogTitle className="text-center text-base font-semibold text-gray-900">
            Logging Out
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-xs text-gray-600 mt-[-5px]">
            Are you sure you want to log out?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2 justify-center">
          <AlertDialogCancel className="flex-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-md px-1 py-1 text-xs !border-indigo-600 !text-indigo-600 hover:!bg-indigo-50">
            No
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-1 py-1 text-xs"
          >
            Yes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
