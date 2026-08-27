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
import { ActionConfirmationDialogProps } from "@/types/dialog-types";

export function ActionConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Yes",
  cancelText = "No",
  isLoading = false,
}: ActionConfirmationDialogProps & { isLoading?: boolean }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[260px] max-w-[90vw] bg-white rounded-3xl border-0 shadow-xl p-4">
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
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-xs text-gray-600 mt-[-5px]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-row gap-2 justify-center">
          <AlertDialogCancel
            disabled={isLoading}
            className="flex-1 border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-md px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
