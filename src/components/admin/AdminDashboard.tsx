import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building2, Users, DollarSign, TrendingUp, Search, Ban, CheckCircle, ArrowLeft, Home, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BUSINESS_TYPES } from "@/utils/businessTypes";
import VisitAnalytics from "@/components/analytics/VisitAnalytics";
import UserManagement from "@/components/admin/UserManagement";
import SubscriptionPlanManagement from "@/components/admin/SubscriptionPlanManagement";
import BusinessSubscriptionManagement from "@/components/admin/BusinessSubscriptionManagement";
import { FinancialDashboard } from "@/components/admin/FinancialDashboard";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { SupportCommunication } from "@/components/admin/SupportCommunication";
import { SecurityAudit } from "@/components/admin/SecurityAudit";
import { ContentModeration } from "@/components/admin/ContentModeration";
import { PlatformHealthMonitoring } from "@/components/admin/PlatformHealthMonitoring";
import AppFeedbackViewer from "@/components/admin/AppFeedbackViewer";
import FeedbackManagement from "@/components/admin/FeedbackManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    expiredSubscriptions: 0,
    monthlyRevenueNGN: 0,
    monthlyRevenueGBP: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [businessTypeFilter, setBusinessTypeFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch all businesses with subscription data
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select(`
          *,
          business_subscriptions (
            *,
            subscription_plans (
              name,
              price_monthly
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (businessError) throw businessError;

      setBusinesses(businessData || []);

      // Fetch subscription statistics
      const { data: subscriptionData, error: subError } = await supabase
        .from('business_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            price_monthly
          )
        `);

      if (subError) throw subError;

      setSubscriptions(subscriptionData || []);

      // Calculate statistics
      const activeCount = subscriptionData?.filter(s => s.status === 'active').length || 0;
      const trialCount = subscriptionData?.filter(s => s.status === 'trial').length || 0;
      const expiredCount = subscriptionData?.filter(s => s.status === 'expired').length || 0;
      
      // Calculate revenue by currency
      const revenueByLocation = subscriptionData?.reduce((acc, sub) => {
        if (sub.status === 'active' && sub.subscription_plans) {
          const business = businessData?.find(b => b.id === sub.business_id);
          const currency = business?.currency || 'NGN';
          
          if (currency === 'GBP') {
            acc.GBP += 15; // UK pricing
          } else {
            acc.NGN += 1500; // Nigeria pricing
          }
        }
        return acc;
      }, { NGN: 0, GBP: 0 }) || { NGN: 0, GBP: 0 };

      setStats({
        totalBusinesses: businessData?.length || 0,
        activeSubscriptions: activeCount,
        trialSubscriptions: trialCount,
        expiredSubscriptions: expiredCount,
        monthlyRevenueNGN: revenueByLocation.NGN,
        monthlyRevenueGBP: revenueByLocation.GBP
      });

    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const toggleBusinessStatus = async (businessId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ is_active: !currentStatus })
        .eq('id', businessId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Business ${!currentStatus ? 'activated' : 'suspended'} successfully`,
      });

      fetchAdminData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredBusinesses = businesses.filter((business: any) => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = businessTypeFilter === "all" || business.business_type === businessTypeFilter;
    return matchesSearch && matchesType;
  });

  const getSubscriptionStatus = (business: any) => {
    const subscription = business.business_subscriptions?.[0];
    if (!subscription) return { status: 'none', color: 'secondary' };
    
    const now = new Date();
    if (subscription.status === 'trial') {
      const trialEnd = new Date(subscription.trial_end_date);
      if (trialEnd > now) {
        return { status: 'trial', color: 'default' };
      } else {
        return { status: 'expired', color: 'destructive' };
      }
    }
    
    if (subscription.status === 'active') {
      return { status: 'active', color: 'default' };
    }
    
    return { status: subscription.status, color: 'destructive' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Platform Administration</h1>
              <p className="text-muted-foreground">Manage businesses, subscriptions, and platform oversight</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  // Sign out and then navigate to landing page
                  const handleBackToLanding = async () => {
                    await supabase.auth.signOut();
                    navigate('/');
                  };
                  handleBackToLanding();
                }}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-muted"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Landing
              </Button>
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="sm"
                className="border-border text-foreground hover:bg-muted"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Admin
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBusinesses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeSubscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trial Users (3 Months)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.trialSubscriptions}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-green-600">₦{stats.monthlyRevenueNGN.toLocaleString()}</div>
                <div className="text-lg font-semibold text-green-600">£{stats.monthlyRevenueGBP.toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="businesses">Businesses</TabsTrigger>
            <TabsTrigger value="locations">Business Locations</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          <TabsContent value="businesses">
            <Card>
              <CardHeader>
                <CardTitle>Business Management</CardTitle>
                <CardDescription>
                  View and manage all registered businesses
                </CardDescription>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search businesses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {BUSINESS_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Owner Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBusinesses.map((business: any) => {
                      const subStatus = getSubscriptionStatus(business);
                      return (
                        <TableRow key={business.id}>
                          <TableCell className="font-medium">{business.name}</TableCell>
                          <TableCell>{business.email}</TableCell>
                          <TableCell className="capitalize">{business.business_type}</TableCell>
                          <TableCell>
                            <Badge variant={subStatus.color as any}>
                              {subStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={business.is_active ? "default" : "secondary"}>
                              {business.is_active ? "Active" : "Suspended"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={business.is_active ? "destructive" : "default"}
                              onClick={() => toggleBusinessStatus(business.id, business.is_active)}
                            >
                              {business.is_active ? (
                                <>
                                  <Ban className="w-3 h-3 mr-1" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle>Business Locations</CardTitle>
                <CardDescription>
                  Geographic distribution of registered businesses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* By Country */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">By Country</h3>
                    <div className="space-y-2">
                      {Object.entries(
                        businesses.reduce((acc: Record<string, number>, b: any) => {
                          const country = b.country || 'Unknown';
                          acc[country] = (acc[country] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      )
                        .sort(([, a], [, b]) => (b as number) - (a as number))
                        .map(([country, count]) => (
                          <div key={country} className="flex items-center justify-between p-3 rounded-xs border">
                            <span className="font-medium">{country}</span>
                            <Badge>{count as number} businesses</Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* By State */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">By State/Region</h3>
                    <div className="space-y-2">
                      {Object.entries(
                        businesses.reduce((acc: Record<string, { state: string; country: string; count: number }>, b: any) => {
                          if (b.state) {
                            const key = `${b.state}, ${b.country || 'Unknown'}`;
                            if (!acc[key]) {
                              acc[key] = { state: b.state, country: b.country || 'Unknown', count: 0 };
                            }
                            acc[key].count++;
                          }
                          return acc;
                        }, {} as Record<string, { state: string; country: string; count: number }>)
                      )
                        .sort(([, a], [, b]) => (b as { state: string; country: string; count: number }).count - (a as { state: string; country: string; count: number }).count)
                        .slice(0, 20)
                        .map(([key, data]) => (
                          <div key={key} className="flex items-center justify-between p-3 rounded-xs border">
                            <span className="font-medium">{key}</span>
                            <Badge>{(data as { state: string; country: string; count: number }).count} businesses</Badge>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* By City */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">By City</h3>
                    <div className="space-y-2">
                      {Object.entries(
                        businesses.reduce((acc: Record<string, { city: string; state: string; count: number }>, b: any) => {
                          if (b.city) {
                            const key = `${b.city}, ${b.state || 'Unknown'}`;
                            if (!acc[key]) {
                              acc[key] = { city: b.city, state: b.state || 'Unknown', count: 0 };
                            }
                            acc[key].count++;
                          }
                          return acc;
                        }, {} as Record<string, { city: string; state: string; count: number }>)
                      )
                        .sort(([, a], [, b]) => (b as { city: string; state: string; count: number }).count - (a as { city: string; state: string; count: number }).count)
                        .slice(0, 20)
                        .map(([key, data]) => (
                          <div key={key} className="flex items-center justify-between p-3 rounded-xs border">
                            <span className="font-medium">{key}</span>
                            <Badge>{(data as { city: string; state: string; count: number }).count} businesses</Badge>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <BusinessSubscriptionManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="plans">
            <SubscriptionPlanManagement />
          </TabsContent>

          <TabsContent value="feedback">
            <AppFeedbackViewer />
          </TabsContent>

          <TabsContent value="analytics">
            <VisitAnalytics />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>

          <TabsContent value="support">
            <SupportCommunication />
          </TabsContent>

          <TabsContent value="security">
            <SecurityAudit />
          </TabsContent>

          <TabsContent value="content">
            <ContentModeration />
          </TabsContent>

          <TabsContent value="health">
            <PlatformHealthMonitoring />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;