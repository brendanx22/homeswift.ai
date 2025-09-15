import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import { X, AlertTriangle, CheckCircle } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  type: "warning" | "success";
  title: string;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showBackHome?: boolean;
  onBackHome?: () => void;
  showEdit?: boolean;
  onEdit?: () => void;
}

export const ConfirmationModal = ({
  open,
  onClose,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Continue",
  cancelText = "Cancel",
  showBackHome,
  onBackHome,
  showEdit,
  onEdit
}: ConfirmationModalProps) => {
  const IconComponent = type === "warning" ? AlertTriangle : CheckCircle;
  const iconColor = type === "warning" ? "text-warning" : "text-success";
  const bgColor = type === "warning" ? "bg-warning/20" : "bg-success/20";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 bg-card border-border">
        <div className="relative p-8 text-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className={`w-16 h-16 mx-auto mb-6 rounded-full ${bgColor} flex items-center justify-center`}>
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <IconComponent className={`h-6 w-6 ${iconColor}`} />
            </div>
          </div>

          <h3 className="text-xl font-semibold text-foreground mb-4">{title}</h3>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex justify-center gap-3">
            {showBackHome && (
              <Button
                onClick={onBackHome}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              >
                <span className="mr-2">⊞</span>
                Back Home
              </Button>
            )}
            {showEdit && (
              <Button
                variant="ghost"
                onClick={onEdit}
                className="text-muted-foreground hover:text-foreground"
              >
                {cancelText}
              </Button>
            )}
            {onConfirm && !showBackHome && (
              <Button
                onClick={onConfirm}
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              >
                {confirmText}
              </Button>
            )}
            {onCancel && !showEdit && !showBackHome && (
              <Button
                variant="ghost"
                onClick={onCancel}
                className="text-destructive hover:text-destructive/80"
              >
                {cancelText}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};