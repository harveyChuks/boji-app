import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSubscription = (businessId?: string) => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!businessId) {
        setLoading(false);
        return;
      }

      try {
        // Check current subscription status
        const { data: statusData } = await supabase
          .rpc('check_business_subscription_status', { p_business_id: businessId });

        // Get subscription details
        const { data: subscriptionData, error: subError } = await supabase
          .from('business_subscriptions')
          .select(`
            *,
            subscription_plans (
              name,
              description,
              price_monthly,
              price_yearly,
              features,
              max_appointments_per_month
            )
          `)
          .eq('business_id', businessId)
          .single();

        if (subError && subError.code !== 'PGRST116') {
          throw subError;
        }

        setSubscription({
          ...subscriptionData,
          currentStatus: statusData
        });
        
        // Check if subscription is expired or needs attention
        if (statusData === 'expired') {
          setError('Your subscription has expired. Please renew to continue using the platform.');
        } else {
          setError(null);
        }

      } catch (err: any) {
        console.error('Error checking subscription:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkSubscriptionStatus();

    // Set up real-time subscription for subscription changes
    if (businessId) {
      const channel = supabase
        .channel('subscription-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'business_subscriptions',
            filter: `business_id=eq.${businessId}`
          },
          () => {
            checkSubscriptionStatus();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    return undefined;
  }, [businessId]);

  return {
    subscription,
    loading,
    error,
    isExpired: subscription?.currentStatus === 'expired',
    isTrialExpired: subscription?.currentStatus === 'expired' && subscription?.status === 'trial',
    trialDaysLeft: subscription?.trial_end_date ? 
      Math.max(0, Math.ceil((new Date(subscription.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0
  };
};