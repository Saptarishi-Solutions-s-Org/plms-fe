import { PasswordErrors, Profile } from "@/types/profile";

export interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  showCurrent: boolean;
  showNew: boolean;
  showConfirm: boolean;
  onToggleShowCurrent: () => void;
  onToggleShowNew: () => void;
  onToggleShowConfirm: () => void;
  errors: PasswordErrors;
  loading: boolean;
  onChangePassword: () => void;
  onCancel: () => void;
}

export interface ProfilePhotoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onUploadClick: () => void;
  onRemovePhoto: () => void;
}

export interface ActionConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ErrorAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionText?: string;
}

export interface LogoutConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}


export type UnderConstructionProps = {
  title: string;
};
