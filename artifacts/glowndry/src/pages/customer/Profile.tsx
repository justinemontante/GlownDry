import { ArrowLeft, User, Mail, Phone, MapPin, ChevronRight, LogOut, Download } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function CustomerProfile() {
  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <header className="px-6 pt-12 pb-6 bg-primary text-primary-foreground rounded-b-[2rem] shadow-sm sticky top-0 z-20 flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/app/dashboard">
            <Button size="icon" variant="ghost" className="rounded-full text-white hover:bg-white/20">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold flex-1">Profile</h1>
        </div>

        <div className="flex items-center gap-5 px-2">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary text-2xl font-bold shadow-md">
            SJ
          </div>
          <div>
            <h2 className="text-2xl font-bold">Sarah Jenkins</h2>
            <p className="text-primary-foreground/80 text-sm">Premium Member</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pb-24 space-y-6">
        
        <div className="bg-white rounded-3xl shadow-sm border p-2 space-y-1">
          <ProfileItem icon={<User />} label="Personal Details" value="Sarah Jenkins" />
          <ProfileItem icon={<Mail />} label="Email Address" value="sarah@example.com" />
          <ProfileItem icon={<Phone />} label="Phone Number" value="+1 (555) 123-4567" />
          <ProfileItem icon={<MapPin />} label="Saved Addresses" value="2 Locations" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-muted-foreground px-4 mb-3 uppercase tracking-wider">Recent Receipts</h3>
          <div className="bg-white rounded-3xl shadow-sm border p-4">
            <div className="flex items-center justify-between p-3 border-b last:border-0">
              <div>
                <p className="font-semibold text-sm">Order #4828</p>
                <p className="text-xs text-muted-foreground">Oct 12, 2023</p>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full">
                <Download className="w-4 h-4 text-primary" />
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border-b last:border-0">
              <div>
                <p className="font-semibold text-sm">Order #4815</p>
                <p className="text-xs text-muted-foreground">Oct 05, 2023</p>
              </div>
              <Button size="icon" variant="ghost" className="rounded-full">
                <Download className="w-4 h-4 text-primary" />
              </Button>
            </div>
          </div>
        </div>

        <Link href="/app/login">
          <Button variant="outline" className="w-full h-14 rounded-xl text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/20 font-semibold mt-4">
            <LogOut className="w-5 h-5 mr-2" /> Sign Out
          </Button>
        </Link>
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors">
      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
        {React.cloneElement(icon, { className: "w-5 h-5" })}
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300" />
    </div>
  );
}
