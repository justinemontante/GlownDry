import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AdminLayout } from "@/components/layout/AdminLayout";

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
      <Route path="/">
        <Redirect to="/admin/login" />
      </Route>
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
