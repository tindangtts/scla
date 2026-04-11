import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/use-admin-auth";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import UsersPage from "@/pages/users";
import UserDetailPage from "@/pages/user-detail";
import UpgradeRequestsPage from "@/pages/upgrade-requests";
import ContentPage from "@/pages/content";
import TicketsPage from "@/pages/tickets";
import FacilitiesPage from "@/pages/facilities";
import FaqsPage from "@/pages/faqs";
import StaffPage from "@/pages/staff";
import AuditLogsPage from "@/pages/audit-logs";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { staff, isLoading } = useAdminAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (!staff && location !== "/login") {
    return <Redirect to="/login" />;
  }

  if (staff && location === "/login") {
    return <Redirect to="/dashboard" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <AuthGuard>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/users/:id" component={UserDetailPage} />
        <Route path="/users" component={UsersPage} />
        <Route path="/upgrade-requests" component={UpgradeRequestsPage} />
        <Route path="/content" component={ContentPage} />
        <Route path="/tickets" component={TicketsPage} />
        <Route path="/facilities" component={FacilitiesPage} />
        <Route path="/faqs" component={FaqsPage} />
        <Route path="/staff" component={StaffPage} />
        <Route path="/audit-logs" component={AuditLogsPage} />
        <Route path="/">
          <Redirect to="/dashboard" />
        </Route>
        <Route>
          <Redirect to="/dashboard" />
        </Route>
      </Switch>
    </AuthGuard>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminAuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AdminAuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
