import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface CustomerProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  total_bookings: number;
  is_loyalty_member: boolean;
  followed_businesses: string[];
}

export const useCustomerAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile fetching
        if (session?.user) {
          setTimeout(() => {
            fetchCustomerProfile(session.user.id);
          }, 0);
        } else {
          setCustomerProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchCustomerProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCustomerProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      // Transform the data to match our interface
      const profile: CustomerProfile = {
        ...(data as any),
        followed_businesses: Array.isArray(data.followed_businesses) 
          ? data.followed_businesses as string[]
          : []
      };
      
      setCustomerProfile(profile);
    } catch (error) {
      console.error('Error fetching customer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCustomerProfile(null);
  };

  const followBusiness = async (businessId: string) => {
    if (!user || !customerProfile) return;

    try {
      const updatedFollows = [...(customerProfile.followed_businesses || []), businessId];
      
      const { error } = await supabase
        .from('customer_profiles')
        .update({ followed_businesses: updatedFollows })
        .eq('id', user.id);

      if (error) throw error;

      setCustomerProfile({
        ...customerProfile,
        followed_businesses: updatedFollows,
      });

      return true;
    } catch (error) {
      console.error('Error following business:', error);
      return false;
    }
  };

  const hasFollowedBusiness = (businessId: string): boolean => {
    return customerProfile?.followed_businesses?.includes(businessId) || false;
  };

  return {
    user,
    session,
    customerProfile,
    loading,
    signOut,
    followBusiness,
    hasFollowedBusiness,
    isAuthenticated: !!user && !!customerProfile,
  };
};
