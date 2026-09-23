import { Outlet, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, LayoutDashboard, FilePlus2, Sparkles, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';

const DashboardLayout = () => {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const NavLinks = () => (
    <>
      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
        <Button variant="ghost" className="w-full justify-start gap-2 text-brand-navy hover:bg-secondary">
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Button>
      </Link>
      <Link to="/kits/new" onClick={() => setMobileMenuOpen(false)}>
        <Button variant="ghost" className="w-full justify-start gap-2 text-brand-navy hover:bg-secondary">
          <FilePlus2 className="h-4 w-4" />
          New Prep Kit
        </Button>
      </Link>
    </>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border/15">
      <div className="h-16 flex items-center px-6 border-b border-border/15">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-brand-navy">
          <Sparkles className="h-5 w-5 text-accent" />
          Trao AI
        </Link>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavLinks />
      </nav>
      
      <div className="p-4 border-t border-border/15">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="text-sm font-medium text-brand-steel truncate">
            {user?.email}
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-border/15" onClick={logout}>
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans text-brand-navy">
      {/* Mobile Header */}
      <header className="md:hidden h-16 border-b border-border/15 bg-card flex items-center justify-between px-4 sticky top-0 z-20">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg text-brand-navy">
          <Sparkles className="h-5 w-5 text-accent" />
          Trao AI
        </Link>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-brand-navy hover:bg-secondary">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r border-border/15">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="max-w-6xl mx-auto p-6 relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
