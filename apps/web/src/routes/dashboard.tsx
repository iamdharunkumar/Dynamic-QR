import { Link, Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import {  LogOut, Plus, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import DqLogo from "@/components/logo";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({
        to: "/login",
        throw: true,
      });
    }
    return { session };
  },
});

function DashboardLayout() {
  const { session } = Route.useRouteContext();
  const user = session.data?.user;

  const handleSignOut = async () => {
      await authClient.signOut();
      window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card hidden md:flex flex-col sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b">
           <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
             <DqLogo />
           </Link>
        </div>
        
        <div className="flex-1 py-6 px-3 flex flex-col gap-1">
           <NavItem to="/dashboard" icon={<QrCode className="h-4 w-4" />} label="My QR Codes" />
           <NavItem to="/dashboard/create" icon={<Plus className="h-4 w-4" />} label="Create New" />
           {/* Placeholder for future routes */}
           <div className="mt-auto"></div>
           <Button variant="ghost" className="justify-start gap-3 w-full text-muted-foreground hover:text-destructive" onClick={handleSignOut}>
             <LogOut className="h-4 w-4" /> Sign Out
           </Button>
        </div>
        
        <div className="p-4 border-t">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                 {user?.name?.[0] || "U"}
              </div>
              <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-medium truncate">{user?.name}</p>
                 <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen">
        <header className="md:hidden h-16 border-b flex items-center px-4 bg-card justify-between sticky top-0 z-10">
           <span className="font-bold">DynamicQR</span>
           <Button variant="ghost" size="icon" onClick={handleSignOut}>
             <LogOut className="h-4 w-4" />
           </Button>
        </header> 
        <div className="p-8 max-w-6xl mx-auto">
           <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
    return (
        <Link to={to} activeProps={{ className: "bg-primary/10 text-primary font-medium" }} className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:bg-muted transition-colors">
            {icon}
            {label}
        </Link>
    )
}
