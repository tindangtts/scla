import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";

import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import HomePage from "@/pages/home";
import BillsPage from "@/pages/bills";
import BillDetailPage from "@/pages/bill-detail";
import StarAssistPage from "@/pages/star-assist";
import NewTicketPage from "@/pages/new-ticket";
import TicketDetailPage from "@/pages/ticket-detail";
import DiscoverPage from "@/pages/discover";
import DiscoverDetailPage from "@/pages/discover-detail";
import BookingsPage from "@/pages/bookings";
import BookingDetailPage from "@/pages/booking-detail";
import WalletPage from "@/pages/wallet";
import InfoPage from "@/pages/info";
import InfoArticlePage from "@/pages/info-article";
import ProfilePage from "@/pages/profile";
import UpgradePage from "@/pages/upgrade";
import NotificationsPage from "@/pages/notifications";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/bills" component={BillsPage} />
      <Route path="/bills/:id" component={BillDetailPage} />
      <Route path="/star-assist/new" component={NewTicketPage} />
      <Route path="/star-assist/:id" component={TicketDetailPage} />
      <Route path="/star-assist" component={StarAssistPage} />
      <Route path="/discover/:id" component={DiscoverDetailPage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/bookings/:id" component={BookingDetailPage} />
      <Route path="/bookings" component={BookingsPage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/info/:id" component={InfoArticlePage} />
      <Route path="/info" component={InfoPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/upgrade" component={UpgradePage} />
      <Route path="/notifications" component={NotificationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
