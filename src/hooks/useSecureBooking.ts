import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BookingData {
  business_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address?: string;
  staff_id?: string;
  notes?: string;
}

interface BookedSlot {
  service_id: string;
  start_at: string;
  end_at: string;
  appointment_date: string;
}

export const useSecureBooking = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkAvailability = async (
    businessId: string,
    dateFrom: string,
    dateTo: string
  ): Promise<BookedSlot[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('check-availability', {
        body: { businessId, dateFrom, dateTo }
      });

      if (error) throw error;
      return data.bookedSlots || [];
    } catch (error) {
      console.error('Error checking availability:', error);
      toast({
        title: "Error",
        description: "Failed to check availability. Please try again.",
        variant: "destructive",
      });
      return [];
    }
  };

  const createBooking = async (bookingData: BookingData) => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('book-appointment', {
        body: bookingData,
        ...(session
          ? { headers: { Authorization: `Bearer ${session.access_token}` } }
          : {})
      });

      if (error) {
        if (error.message?.includes('409')) {
          toast({
            title: "Slot Unavailable",
            description: "This time slot is no longer available. Please choose another time.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return null;
      }

      toast({
        title: "Success",
        description: "Your appointment has been booked successfully!",
      });

      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    checkAvailability,
    createBooking
  };
};
