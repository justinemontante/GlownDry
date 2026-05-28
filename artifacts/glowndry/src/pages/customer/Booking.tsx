import React, { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WashingMachine, ArrowLeft, CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const SERVICES = [
  { id: "wash-fold", name: "Wash & Fold", price: "$4/kg" },
  { id: "dry-clean", name: "Dry Clean", price: "$12/item" },
  { id: "press", name: "Iron & Press", price: "$3/item" },
  { id: "express", name: "Express 24h", price: "+$10" },
];

const TIME_SLOTS = ["09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM"];

export default function CustomerBooking() {
  const [date, setDate] = useState<Date>();
  const [selectedService, setSelectedService] = useState("wash-fold");
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);

  return (
    <div className="h-full bg-slate-50 flex flex-col">
      <header className="px-6 pt-12 pb-4 bg-white border-b sticky top-0 z-20 flex items-center gap-4">
        <Link href="/app/dashboard">
          <Button size="icon" variant="ghost" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-foreground flex-1">Book Service</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        {/* Service Selection */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">1. Select Service</h2>
          <div className="grid grid-cols-2 gap-3">
            {SERVICES.map((s) => (
              <div 
                key={s.id} 
                onClick={() => setSelectedService(s.id)}
                className={cn(
                  "p-4 rounded-2xl border cursor-pointer transition-all",
                  selectedService === s.id 
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                    : "bg-white border-border hover:border-primary/30"
                )}
              >
                <div className="font-semibold text-sm mb-1">{s.name}</div>
                <div className="text-xs text-primary font-medium">{s.price}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Schedule */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">2. Schedule Pickup</h2>
          
          <div className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full h-14 justify-start text-left font-normal rounded-xl",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                    selectedTime === time 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-white text-muted-foreground border-border hover:border-primary/30"
                  )}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Details */}
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">3. Details</h2>
          <div className="space-y-4 bg-white p-5 rounded-2xl border shadow-sm">
            <div className="space-y-2">
              <Label>Estimated Weight (kg)</Label>
              <Input type="number" placeholder="5" className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Special Instructions</Label>
              <Textarea placeholder="Please use gentle detergent..." className="resize-none rounded-xl" />
            </div>
          </div>
        </section>
      </div>

      <div className="absolute bottom-20 left-0 right-0 p-4 bg-white border-t z-20">
        <Link href="/app/tracker">
          <Button className="w-full h-14 rounded-xl text-lg font-semibold shadow-lg shadow-primary/20">
            Confirm Booking
          </Button>
        </Link>
      </div>
    </div>
  );
}
