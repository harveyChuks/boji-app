import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarClock, Phone, User } from "lucide-react";

export interface PendingBooking {
  id: string;
  customer_name: string;
  customer_phone: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  notes?: string | null;
}

interface NewBookingAlertProps {
  booking: PendingBooking | null;
  onClose: () => void;
}

const NewBookingAlert = ({ booking, onClose }: NewBookingAlertProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const updateStatus = async (status: "confirmed" | "cancelled") => {
    if (!booking) return;
    setSaving(true);
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", booking.id);
    setSaving(false);

    if (error) {
      toast({
        title: "Could not update booking",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: status === "confirmed" ? "Booking confirmed" : "Booking declined",
      description: `${booking.customer_name} — ${booking.appointment_date} at ${booking.start_time?.slice(0, 5)}`,
    });
    onClose();
  };

  return (
    <AlertDialog open={!!booking} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>New booking request 🎉</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" /> {booking?.customer_name}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> {booking?.customer_phone}
              </div>
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4" />
                {booking?.appointment_date} · {booking?.start_time?.slice(0, 5)} -{" "}
                {booking?.end_time?.slice(0, 5)}
              </div>
              {booking?.notes && <p className="pt-1">“{booking.notes}”</p>}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={saving}>Later</AlertDialogCancel>
          <button
            type="button"
            disabled={saving}
            onClick={() => updateStatus("cancelled")}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border px-4 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Decline
          </button>
          <AlertDialogAction disabled={saving} onClick={(e) => { e.preventDefault(); updateStatus("confirmed"); }}>
            Confirm booking
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default NewBookingAlert;