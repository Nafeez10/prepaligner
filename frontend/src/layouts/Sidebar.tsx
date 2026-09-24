import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, LayoutDashboard, FilePlus2 } from 'lucide-react';
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import WarningModal from '@/components/ui/warning-modal';

export const Sidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const { setOpenMobile } = useSidebar();
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    setOpenMobile(false);
    setIsSignOutModalOpen(false);
  };

  return (
    <ShadcnSidebar>
      <SidebarHeader className="h-16 flex items-center px-6 border-b border-border/15 justify-center">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-brand-navy w-full" onClick={() => setOpenMobile(false)}>
          <img src="/logo.svg" alt="Prep Aligner Logo" className="h-6 w-6 rounded" />
          Prep Aligner
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2 pt-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/dashboard'} className="text-brand-navy data-[active=true]:bg-secondary">
              <Link to="/dashboard" onClick={() => setOpenMobile(false)}>
                <LayoutDashboard />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === '/kits/new'} className="text-brand-navy data-[active=true]:bg-secondary">
              <Link to="/kits/new" onClick={() => setOpenMobile(false)}>
                <FilePlus2 />
                <span>New Prep Kit</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-border/15">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="text-sm font-medium text-brand-steel truncate">
            {user?.email}
          </div>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setIsSignOutModalOpen(true)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <WarningModal
        isOpen={isSignOutModalOpen}
        onCancel={() => setIsSignOutModalOpen(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmText="Sign Out"
        isDestructive
      />
    </ShadcnSidebar>
  );
};
