import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface MyAppointment {
  id: string;
  customer_id: string;
  business_id: string;
  service_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
}

export const useMyAppointments = () => {
  const [appointments, setAppointments] = useState<MyAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchMyAppointments = async () => {
      if (!isAuthenticated || !user) {
        setAppointments([]);
        setLoading(false);
        return;
      }

      try {
        // Use the secure view that enforces RLS
        const { data, error } = await supabase
          .from('my_appointments')
          .select('*')
          .order('appointment_date', { ascending: true })
          .order('start_time', { ascending: true });

        if (error) throw error;
        setAppointments((data || []) as any);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyAppointments();
  }, [user, isAuthenticated]);

  return { appointments, loading };
};
