"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Image from "next/image";
import { ErrorAlertDialogProps } from "@/types/dialog-types";


export function ErrorAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  actionText = "OK",
}: ErrorAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[260px] max-w-[90vw] bg-white rounded-3xl border-0 shadow-xl p-4">
        <AlertDialogHeader className="text-center">
          <div className="flex justify-center">
            <Image
              src="/saptarishi.png"
              alt="Saptarishi"
              width={100}
              height={100}
              className="object-contain"
            />
          </div>

          <AlertDialogTitle className="text-center text-base font-semibold text-gray-900">
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-xs text-gray-600 mt-[-5px]">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="justify-center">
          <AlertDialogAction
            onClick={() => onOpenChange(false)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-2 py-1 text-xs"
          >
            {actionText}
          </AlertDialogAction>
        </AlertDialogFooter>

      </AlertDialogContent>
    </AlertDialog>
  );
}
