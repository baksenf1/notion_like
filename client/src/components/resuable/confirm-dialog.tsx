import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  children?: React.ReactNode;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  isLoading,
  onClose,
  onConfirm,
  title = "Confirm Action",
  description = "Are you sure you want to perform this action?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  children,
}) => {
  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="z-[70] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children && <div className="py-4">{children}</div>}
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <span>{cancelText}</span>
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            <span
              className={`flex size-4 items-center justify-center ${
                isLoading ? "" : "invisible"
              }`}
            >
              <Loader className="size-4 animate-spin" />
            </span>
            <span>{confirmText}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
