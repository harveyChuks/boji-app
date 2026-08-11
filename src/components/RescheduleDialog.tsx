import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import TimeSlotPicker from "./TimeSlotPicker";

interface RescheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  businessId: string;
  currentDate: string;
  currentStartTime: string;
  currentEndTime: string;
  durationMinutes: number;
  onRescheduled: () => void;
}

export const RescheduleDialog = ({
  open,
  onOpenChange,
  appointmentId,
  businessId,
  currentDate,
  currentStartTime,
  currentEndTime,
  durationMinutes,
  onRescheduled,
}: RescheduleDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newDate, setNewDate] = useState(currentDate);
  const [newTime, setNewTime] = useState("");

  const convertTimeToPostgresFormat = (timeString: string) => {
    const [time = '', period = ''] = timeString.split(' ');
    let [hours = '0', minutes = '00'] = time.split(':');
    
    if (period === 'PM' && hours !== '12') {
      hours = String(parseInt(hours) + 12);
    } else if (period === 'AM' && hours === '12') {
      hours = '00';
    }
    
    return `${hours.padStart(2, '0')}:${minutes}:00`;
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours = 0, minutes = 0] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      toast({
        title: "Error",
        description: "Please select a new date and time",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const newStartTime = convertTimeToPostgresFormat(newTime);
      const newEndTime = calculateEndTime(newStartTime, durationMinutes);

      const response = await fetch(
        'https://xbfwwtfnnpksjyolgpxe.supabase.co/functions/v1/handle-booking-action',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            appointmentId,
            action: 'reschedule',
            newDate,
            newStartTime,
            newEndTime,
            reason: 'Rescheduled by business owner',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reschedule appointment');
      }

      toast({
        title: "Success",
        description: "Appointment rescheduled successfully",
      });

      onRescheduled();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error rescheduling appointment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reschedule appointment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select a new date and time for this appointment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newDate">New Date</Label>
            <Input
              id="newDate"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="bg-input border-border text-foreground"
              required
            />
          </div>

          {newDate && businessId && (
            <div className="space-y-2">
              <Label>Available Time Slots</Label>
              <TimeSlotPicker
                businessId={businessId}
                date={newDate}
                durationMinutes={durationMinutes}
                selectedTime={newTime}
                onTimeSelect={setNewTime}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border text-foreground hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReschedule}
            disabled={loading || !newDate || !newTime}
            className="bg-amber-500 hover:bg-amber-600 text-black"
          >
            {loading ? "Rescheduling..." : "Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
