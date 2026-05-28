import { Bell, FileText, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CustomerNotifications() {
  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <header className="px-6 pt-12 pb-4 bg-white border-b sticky top-0 z-20 flex items-center gap-4">
        <Link href="/app/dashboard">
          <Button size="icon" variant="ghost" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-foreground flex-1">Updates</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-6 h-12 bg-slate-200/50 rounded-xl p-1">
            <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Notifications</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">History</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-3 m-0">
            <NotificationCard 
              title="Order Picked Up" 
              message="Your laundry has been picked up by our driver." 
              time="10 min ago" 
              unread={true} 
            />
            <NotificationCard 
              title="Promo Code" 
              message="Get 10% off your next dry cleaning with code GLOW10." 
              time="2 hours ago" 
            />
            <NotificationCard 
              title="Order Delivered" 
              message="Your order #4828 has been delivered." 
              time="Yesterday" 
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-3 m-0">
            <HistoryCard orderId="#4828" date="Oct 12, 2023" amount="$24.00" status="Completed" />
            <HistoryCard orderId="#4815" date="Oct 05, 2023" amount="$45.50" status="Completed" />
            <HistoryCard orderId="#4790" date="Sep 28, 2023" amount="$18.00" status="Completed" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function NotificationCard({ title, message, time, unread = false }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex gap-4">
      <div className="mt-1 relative">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <Bell className="w-5 h-5 text-primary" />
        </div>
        {unread && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-sm">{title}</h4>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{message}</p>
        <p className="text-[10px] text-muted-foreground mt-2 font-medium">{time}</p>
      </div>
    </div>
  );
}

function HistoryCard({ orderId, date, amount, status }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
          <FileText className="w-5 h-5 text-slate-500" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">{orderId}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-sm">{amount}</p>
        <div className="flex items-center justify-end gap-1 mt-1 text-green-600">
          <CheckCircle className="w-3 h-3" />
          <span className="text-[10px] font-medium">{status}</span>
        </div>
      </div>
    </div>
  );
}
