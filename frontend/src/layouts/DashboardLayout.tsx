import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, LayoutDashboard, FilePlus2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardLayout = () => {
  const { isAuthenticated, isLoading, logout, user } = useAuth();

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
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 glass border-r border-white/5 flex-shrink-0 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Sparkles className="h-5 w-5" />
            Trao AI
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/dashboard">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/kits/new">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <FilePlus2 className="h-4 w-4" />
              New Prep Kit
            </Button>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="text-sm font-medium text-muted-foreground truncate">
              {user?.email}
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto p-6 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
