import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, X } from 'lucide-react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="bg-card border-border/15 shadow-sm w-full max-w-md border-destructive/50 relative overflow-hidden">
        {/* Top accent bar */}
        <div className={`h-1 w-full absolute top-0 left-0 ${isDestructive ? 'bg-destructive' : 'bg-primary'}`} />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground" 
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="p-6 flex flex-col items-center text-center gap-4 mt-2">
          <div className={`p-4 rounded-full ${isDestructive ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            <AlertCircle className="h-10 w-10" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-2">
              {title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {description}
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 w-full justify-center">
            <Button variant="ghost" className="w-full" onClick={onCancel}>
              {cancelText}
            </Button>
            <Button 
              className={`w-full ${isDestructive ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 'bg-primary hover:bg-primary/90'}`}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WarningModal;
