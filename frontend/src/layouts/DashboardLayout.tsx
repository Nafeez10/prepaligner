import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Sidebar } from './Sidebar';

const DashboardLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative h-svh w-full">
        {/* Mobile Header with Trigger */}
        <div className="p-4 md:hidden flex items-center border-b border-border/15 bg-card sticky top-0 z-20">
          <SidebarTrigger />
          <Link to="/dashboard" className="ml-3 font-bold text-lg text-brand-navy flex items-center gap-2">
            <img src="/logo.svg" alt="Prep Aligner Logo" className="h-6 w-6 rounded" />
            Prep Aligner
          </Link>
        </div>
        
        <div className="max-w-6xl mx-auto p-6 relative z-10">
          <Outlet />
        </div>
      </main>
    </SidebarProvider>
  );
};

export default DashboardLayout;
