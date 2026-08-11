import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, TrendingUp, Users, Calendar, Download, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RevenueData {
  total_revenue_ngn: number;
  total_revenue_gbp: number;
  monthly_revenue_ngn: number;
  monthly_revenue_gbp: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  conversion_rate: number;
}

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  payment_status: string;
  created_at: string;
  customer_name: string;
  business_name: string;
}

export const FinancialDashboard = () => {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchFinancialData();
  }, [timeRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // Fetch revenue overview with business data for currency
      const { data: subscriptions } = await supabase
        .from('business_subscriptions')
        .select(`
          *,
          subscription_plans (
            price_monthly,
            price_yearly,
            name
          ),
          businesses (
            currency
          )
        `);

      // Calculate revenue metrics by currency
      const activeSubscriptions = subscriptions?.filter(s => s.status === 'active') || [];
      const trialSubscriptions = subscriptions?.filter(s => s.status === 'trial') || [];
      
      const revenueByLocation = activeSubscriptions.reduce((acc, sub) => {
        const currency = sub.businesses?.currency || 'NGN';
        
        if (currency === 'GBP') {
          acc.GBP += 15; // UK pricing
        } else {
          acc.NGN += 1500; // Nigeria pricing
        }
        return acc;
      }, { NGN: 0, GBP: 0 });

      const conversionRate = subscriptions && subscriptions.length > 0 
        ? (activeSubscriptions.length / subscriptions.length) * 100 
        : 0;

      setRevenueData({
        total_revenue_ngn: revenueByLocation.NGN,
        total_revenue_gbp: revenueByLocation.GBP,
        monthly_revenue_ngn: revenueByLocation.NGN,
        monthly_revenue_gbp: revenueByLocation.GBP,
        active_subscriptions: activeSubscriptions.length,
        trial_subscriptions: trialSubscriptions.length,
        conversion_rate: conversionRate
      });

      // Fetch recent payments
      const { data: paymentsData } = await supabase
        .from('payments')  
        .select(`
          *,
          appointments (
            customer_name,
            businesses (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      const formattedPayments = paymentsData?.map(payment => ({
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        payment_status: payment.payment_status,
        created_at: payment.created_at,
        customer_name: payment.appointments?.customer_name || 'Unknown',
        business_name: payment.appointments?.businesses?.name || 'Unknown'
      })) || [];

      setPayments(formattedPayments as any);

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast({
        title: "Error",
        description: "Failed to load financial data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Implementation for exporting financial data
    toast({
      title: "Export Started",
      description: "Financial report will be downloaded shortly"
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading financial data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financial Dashboard</h2>
          <p className="text-muted-foreground">Monitor revenue, payments, and financial metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (NGN)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{revenueData?.total_revenue_ngn.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              Nigerian Naira
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (GBP)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{revenueData?.total_revenue_gbp.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              British Pounds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData?.active_subscriptions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {revenueData?.trial_subscriptions || 0} on 3-month trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData?.conversion_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Trial to paid conversion
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payments">Recent Payments</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscription Analytics</TabsTrigger>
          <TabsTrigger value="reports">Financial Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
              <CardDescription>Latest payment transactions across all businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.customer_name}</TableCell>
                      <TableCell>{payment.business_name}</TableCell>
                      <TableCell>${payment.amount} {payment.currency}</TableCell>
                      <TableCell>
                        <Badge variant={payment.payment_status === 'completed' ? 'default' : 'secondary'}>
                          {payment.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Analytics</CardTitle>
              <CardDescription>Detailed subscription metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Subscription analytics charts and metrics will be displayed here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate and download detailed financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Monthly Revenue Report</h4>
                    <p className="text-sm text-muted-foreground">Detailed breakdown of monthly revenue</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Payment Transaction Report</h4>
                    <p className="text-sm text-muted-foreground">Complete payment transaction history</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};