import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Landing from "@/pages/Landing";
import { MobileFrame } from "@/components/layout/MobileFrame";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Customer App Pages
import CustomerLogin from "@/pages/customer/Login";
import CustomerRegister from "@/pages/customer/Register";
import CustomerDashboard from "@/pages/customer/Dashboard";
import CustomerBooking from "@/pages/customer/Booking";
import CustomerTracker from "@/pages/customer/Tracker";
import CustomerNotifications from "@/pages/customer/Notifications";
import CustomerProfile from "@/pages/customer/Profile";

// Admin App Pages
import AdminLogin from "@/pages/admin/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminBookings from "@/pages/admin/Bookings";
import AdminServices from "@/pages/admin/Services";
import AdminInventory from "@/pages/admin/Inventory";
import AdminCustomers from "@/pages/admin/Customers";
import AdminPayments from "@/pages/admin/Payments";
import AdminReports from "@/pages/admin/Reports";

const queryClient = new QueryClient();

// Customer App Router
function CustomerRouter() {
  return (
    <MobileFrame>
      <Switch>
        <Route path="/app" component={CustomerLogin} />
        <Route path="/app/login" component={CustomerLogin} />
        <Route path="/app/register" component={CustomerRegister} />
        <Route path="/app/dashboard" component={CustomerDashboard} />
        <Route path="/app/booking" component={CustomerBooking} />
        <Route path="/app/tracker" component={CustomerTracker} />
        <Route path="/app/notifications" component={CustomerNotifications} />
        <Route path="/app/profile" component={CustomerProfile} />
        <Route component={NotFound} />
      </Switch>
    </MobileFrame>
  );
}

// Admin App Router
function AdminRouter() {
  return (
    <Switch>
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        <AdminLayout>
          <Switch>
            <Route path="/admin/dashboard" component={AdminDashboard} />
            <Route path="/admin/bookings" component={AdminBookings} />
            <Route path="/admin/services" component={AdminServices} />
            <Route path="/admin/inventory" component={AdminInventory} />
            <Route path="/admin/customers" component={AdminCustomers} />
            <Route path="/admin/payments" component={AdminPayments} />
            <Route path="/admin/reports" component={AdminReports} />
            <Route component={NotFound} />
          </Switch>
        </AdminLayout>
      </Route>
    </Switch>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app/*" component={CustomerRouter} />
      <Route path="/admin/*" component={AdminRouter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
