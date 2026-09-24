import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { AnimatedUnderline } from '@/components/ui/animated-underline';

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/30 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-4 sm:p-8 flex flex-col items-center">
        {/* Logo Header */}
        <div className="flex items-center gap-2 mb-8">
          <img src="/logo.svg" alt="Prep Aligner Logo" className="h-8 w-8 rounded-md shadow-sm" />
          <span className="font-bold text-2xl text-foreground tracking-tight">Prep Aligner</span>
        </div>

        {/* Auth Container */}
        <div className="bg-card border-border/15 shadow-xl rounded-2xl p-8 space-y-6 w-full">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground flex items-center justify-center">
          Developed by 
          <AnimatedUnderline className="ml-2 font-semibold text-foreground">
            Nafeez10
          </AnimatedUnderline>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
