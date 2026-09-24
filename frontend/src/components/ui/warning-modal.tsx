import { AlertCircle } from 'lucide-react';
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

interface WarningModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

const WarningModal = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = true
}: WarningModalProps) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel() }}>
      <AlertDialogContent className="w-[calc(100%-2rem)] sm:max-w-md rounded-xl border border-border/60 shadow-xl p-0 gap-0 overflow-hidden">
        <AlertDialogHeader className="p-3 border-b border-border/30 flex flex-row items-center gap-3 space-y-0 text-left">
          <div className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${isDestructive ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-primary'}`}>
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <AlertDialogTitle className="text-base sm:text-xl font-semibold tracking-tight">
            {title}
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="p-3 py-3">
          <AlertDialogDescription className="text-sm sm:text-base text-foreground/90 text-left">
            {description}
          </AlertDialogDescription>
        </div>

        <AlertDialogFooter className="p-3 pt-2 w-full flex flex-row justify-end gap-2 space-x-0">
          <AlertDialogCancel onClick={onCancel} className="mt-0 w-auto h-8 px-3 text-xs">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`w-auto h-8 px-3 text-xs ${isDestructive ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WarningModal;
