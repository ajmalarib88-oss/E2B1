import { Switch, Route, Router, Link, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import TambahRekod from "@/pages/tambah-rekod";
import SenaraiRekod from "@/pages/senarai-rekod";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Shield,
  Menu,
  X,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/tambah", label: "Tambah Rekod", icon: PlusCircle },
    { path: "/senarai", label: "Senarai Rekod", icon: List },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-sidebar border-r border-sidebar-border
          flex flex-col transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-sidebar-foreground leading-tight">REKOD PERKAUMAN</h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wider">VIEAL E2B1</p>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto lg:hidden h-7 w-7" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors
                    ${isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }
                  `}
                  onClick={onClose}
                  data-testid={`nav-${item.path === "/" ? "dashboard" : item.path.slice(1)}`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs text-muted-foreground">Sistem Aktif</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">PDRM E2B1 Intelligence Unit</p>
        </div>
      </aside>
    </>
  );
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <div className="h-dvh flex overflow-hidden bg-background">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 border-b flex items-center px-4 gap-3 shrink-0 bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={() => setSidebarOpen(true)}
            data-testid="button-menu"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <h2 className="text-sm font-semibold">Sistem Rekod Perkauman Malaysia</h2>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDark(!dark)}
              data-testid="button-theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/tambah" component={TambahRekod} />
            <Route path="/senarai" component={SenaraiRekod} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router hook={useHashLocation}>
          <AppLayout />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
