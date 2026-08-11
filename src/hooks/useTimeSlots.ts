
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TimeSlot {
  slot_time: string;
  is_available: boolean;
}

export const useTimeSlots = (businessId: string, date: string, durationMinutes: number, staffId?: string) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchTimeSlots = async (forceFresh = false) => {
    if (!businessId || !date || !durationMinutes) return;

    setLoading(true);
    try {
      const timestamp = new Date().getTime();
      console.log(`${forceFresh ? 'Force refreshing' : 'Fetching'} time slots for:`, { 
        businessId, 
        date, 
        durationMinutes, 
        staffId, 
        timestamp 
      });
      
      // AGGRESSIVE CACHE BUSTING - Use fresh headers and disable all caching
      const { data, error } = await supabase
        .rpc('get_available_time_slots', {
          p_business_id: businessId,
          p_date: date,
          p_duration_minutes: durationMinutes,
          p_staff_id: (staffId || null) as any
        });

      if (error) {
        console.error('Error fetching time slots:', error);
        throw error;
      }
      
      console.log('🔥 BACKEND RESPONSE:', {
        timestamp,
        dataLength: data?.length || 0,
        bookedCount: data?.filter((slot: TimeSlot) => !slot.is_available).length || 0,
        availableCount: data?.filter((slot: TimeSlot) => slot.is_available).length || 0,
        firstSlot: data?.[0] || null,
        secondSlot: data?.[1] || null
      });
      
      setTimeSlots(data || []);
    } catch (error: any) {
      console.error('Error fetching time slots:', error);
      toast({
        title: "Error",
        description: "Failed to load available time slots",
        variant: "destructive",
      });
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeSlots();
  }, [businessId, date, durationMinutes, staffId]);

  const checkConflict = async (
    appointmentDate: string,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string
  ): Promise<boolean> => {
    try {
      console.log('Checking conflict for:', { businessId, appointmentDate, startTime, endTime, staffId, excludeAppointmentId });
      
      const { data, error } = await supabase.rpc('check_appointment_conflict', {
        p_business_id: businessId,
        p_appointment_date: appointmentDate,
        p_start_time: startTime,
        p_end_time: endTime,
        p_staff_id: (staffId || null) as any,
        p_exclude_appointment_id: (excludeAppointmentId || null) as any
      });

      if (error) {
        console.error('Error checking appointment conflict:', error);
        throw error;
      }
      
      console.log('Conflict check result:', data);
      return data || false;
    } catch (error) {
      console.error('Error checking appointment conflict:', error);
      // Return true to prevent booking if there's an error checking conflicts
      return true;
    }
  };

  // Enhanced function to verify slot is still available right before booking
  const verifySlotAvailable = async (timeSlot: string): Promise<boolean> => {
    try {
      // Fetch fresh time slots data
      const { data, error } = await supabase.rpc('get_available_time_slots', {
        p_business_id: businessId,
        p_date: date,
        p_duration_minutes: durationMinutes,
        p_staff_id: (staffId || null) as any
      });

      if (error) {
        console.error('Error verifying slot availability:', error);
        return false;
      }

      const slot = data?.find((s: TimeSlot) => {
        const slotTime = new Date(`2000-01-01T${s.slot_time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        return slotTime === timeSlot;
      });

      return slot?.is_available || false;
    } catch (error) {
      console.error('Error verifying slot availability:', error);
      return false;
    }
  };

  return {
    timeSlots,
    loading,
    refetch: () => fetchTimeSlots(true), // Force fresh data on manual refresh
    checkConflict,
    verifySlotAvailable
  };
};
