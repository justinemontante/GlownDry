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
      {[
        { path: "/admin/dashboard", Component: AdminDashboard },
        { path: "/admin/bookings", Component: AdminBookings },
        { path: "/admin/services", Component: AdminServices },
        { path: "/admin/inventory", Component: AdminInventory },
        { path: "/admin/customers", Component: AdminCustomers },
        { path: "/admin/payments", Component: AdminPayments },
        { path: "/admin/reports", Component: AdminReports },
      ].map(({ path, Component }) => (
        <Route key={path} path={path}>
          <AdminLayout><Component /></AdminLayout>
        </Route>
      ))}
      <Route path="/admin">
        <Redirect to="/admin/dashboard" />
      </Route>
      <Route component={NotFound} />
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
