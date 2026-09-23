import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { KitsAPI, useKitStatus } from '@/api/routes/KitsAPI';
import { KitSummary } from '@/api/routes/KitsAPI/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle2, Clock, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import WarningModal from '@/components/ui/warning-modal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type KitCardProps = {
  kit: KitSummary;
  onDeleteSuccess: () => void;
  onStatusChange: () => void;
};

const KitCard = ({ kit, onDeleteSuccess, onStatusChange }: KitCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { status } = useKitStatus(kit._id, kit.status);
  const previousStatusRef = useRef(kit.status);

  // When status transitions from "generating" → "completed"/"failed", notify parent to refresh the list
  useEffect(() => {
    if (previousStatusRef.current === 'generating' && status !== 'generating') {
      onStatusChange();
    }
    previousStatusRef.current = status;
  }, [status, onStatusChange]);

  const handleDelete = async () => {
    try {
      await KitsAPI.deleteKit(kit._id);
      toast.success('Kit deleted successfully');
      onDeleteSuccess();
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete kit');
    }
  };

  return (
    <>
      <Link to={`/kits/${kit._id}`} className="block group relative">
        <Card className="h-full transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 bg-card border-border/15 shadow-sm">
        <div className="absolute top-4 right-4 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Kit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardHeader>
          <CardTitle className="text-xl group-hover:text-primary transition-colors pr-8 break-words break-all">
            {kit.title}
          </CardTitle>
          <CardDescription>
            {new Date(kit.createdAt).toLocaleDateString(undefined, { 
              year: 'numeric', month: 'short', day: 'numeric' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {status === 'completed' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500 border border-green-500/20">
                <CheckCircle2 className="h-3 w-3" />
                Ready
              </span>
            )}
            {status === 'generating' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-500 border border-blue-500/20">
                <Clock className="h-3 w-3 animate-spin" />
                Generating
              </span>
            )}
            {status === 'failed' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive border border-destructive/20">
                <AlertCircle className="h-3 w-3" />
                Failed
              </span>
            )}
          </div>
        </CardContent>
      </Card>
      </Link>

      <WarningModal
        isOpen={isDeleteDialogOpen}
        title="Delete Kit"
        description={`Are you sure you want to delete "${kit.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
};

export default KitCard;
