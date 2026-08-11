import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, DollarSign, Users, TrendingUp, TrendingDown, Calendar, Clock, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

interface ServiceData {
  name: string;
  count: number;
  revenue: number;
  color: string;
}

interface StaffData {
  name: string;
  bookings: number;
  revenue: number;
}

interface OverviewStats {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  completionRate: number;
  cancellationRate: number;
  revenueGrowth: number;
  bookingGrowth: number;
}

const ReportsAnalytics = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("30");
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [serviceData, setServiceData] = useState<ServiceData[]>([]);
  const [staffData, setStaffData] = useState<StaffData[]>([]);
  const [businessData, setBusinessData] = useState<any>(null);
  const { toast } = useToast();

  const colors = ['#39FF14', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'];

  const fetchAnalyticsData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const days = parseInt(dateRange);
      const endDate = new Date();
      const startDate = subDays(endDate, days);

      // Get current user's business
      const { data: business } = await supabase
        .from('businesses')
        .select('id, currency')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (!business) {
        toast({
          title: "Error",
          description: "No business found. Please set up your business first.",
          variant: "destructive",
        });
        return;
      }

      console.log('Business data in ReportsAnalytics:', business);
      setBusinessData(business);

      const businessId = business.id;

      // Fetch appointments with related data
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (name, price),
          staff (name)
        `)
        .eq('business_id', businessId)
        .gte('appointment_date', format(startDate, 'yyyy-MM-dd'))
        .lte('appointment_date', format(endDate, 'yyyy-MM-dd'));

      if (error) throw error;

      if (!appointments || appointments.length === 0) {
        setOverviewStats({
          totalRevenue: 0,
          totalBookings: 0,
          averageBookingValue: 0,
          completionRate: 0,
          cancellationRate: 0,
          revenueGrowth: 0,
          bookingGrowth: 0,
        });
        setRevenueData([]);
        setServiceData([]);
        setStaffData([]);
        return;
      }

      // Calculate overview stats
      const completedAppointments = appointments.filter(a => a.status === 'completed');
      const cancelledAppointments = appointments.filter(a => a.status === 'cancelled');
      const totalRevenue = completedAppointments.reduce((sum, a) => sum + (a.services?.price || 0), 0);
      const totalBookings = appointments.length;
      const averageBookingValue = totalRevenue / (completedAppointments.length || 1);
      const completionRate = (completedAppointments.length / totalBookings) * 100;
      const cancellationRate = (cancelledAppointments.length / totalBookings) * 100;

      // Calculate growth (comparing to previous period)
      const previousStartDate = subDays(startDate, days);
      const { data: previousAppointments } = await supabase
        .from('appointments')
        .select(`*, services (price)`)
        .eq('business_id', businessId)
        .gte('appointment_date', format(previousStartDate, 'yyyy-MM-dd'))
        .lt('appointment_date', format(startDate, 'yyyy-MM-dd'));

      const previousRevenue = previousAppointments?.filter(a => a.status === 'completed')
        .reduce((sum, a) => sum + (a.services?.price || 0), 0) || 0;
      const previousBookings = previousAppointments?.length || 0;

      const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      const bookingGrowth = previousBookings > 0 ? ((totalBookings - previousBookings) / previousBookings) * 100 : 0;

      setOverviewStats({
        totalRevenue,
        totalBookings,
        averageBookingValue,
        completionRate,
        cancellationRate,
        revenueGrowth,
        bookingGrowth,
      });

      // Process revenue data by day
      const revenueByDay: { [key: string]: { revenue: number; bookings: number } } = {};
      
      for (let i = 0; i < days; i++) {
        const date = subDays(endDate, i);
        const dateStr = format(date, 'MMM dd');
        revenueByDay[dateStr] = { revenue: 0, bookings: 0 };
      }

      completedAppointments.forEach(appointment => {
        const dateStr = format(new Date(appointment.appointment_date), 'MMM dd');
        if (revenueByDay[dateStr]) {
          revenueByDay[dateStr].revenue += appointment.services?.price || 0;
          revenueByDay[dateStr].bookings += 1;
        }
      });

      const revenueChartData = Object.entries(revenueByDay)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          bookings: data.bookings,
        }))
        .reverse();

      setRevenueData(revenueChartData);

      // Process service data
      const serviceStats: { [key: string]: { count: number; revenue: number } } = {};
      
      completedAppointments.forEach(appointment => {
        const serviceName = appointment.services?.name || 'Unknown Service';
        if (!serviceStats[serviceName]) {
          serviceStats[serviceName] = { count: 0, revenue: 0 };
        }
        serviceStats[serviceName].count += 1;
        serviceStats[serviceName].revenue += appointment.services?.price || 0;
      });

      const serviceChartData = Object.entries(serviceStats)
        .map(([name, data], index) => ({
          name,
          count: data.count,
          revenue: data.revenue,
          color: colors[index % colors.length],
        }))
        .sort((a, b) => b.revenue - a.revenue);

      setServiceData(serviceChartData);

      // Process staff data
      const staffStats: { [key: string]: { bookings: number; revenue: number } } = {};
      
      completedAppointments.forEach(appointment => {
        const staffName = appointment.staff?.name || 'Unassigned';
        if (!staffStats[staffName]) {
          staffStats[staffName] = { bookings: 0, revenue: 0 };
        }
        staffStats[staffName].bookings += 1;
        staffStats[staffName].revenue += appointment.services?.price || 0;
      });

      const staffChartData = Object.entries(staffStats)
        .map(([name, data]) => ({
          name,
          bookings: data.bookings,
          revenue: data.revenue,
        }))
        .sort((a, b) => b.revenue - a.revenue);

      setStaffData(staffChartData);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();

    // Set up real-time subscription for appointments
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        () => {
          // Refetch analytics when appointments change
          fetchAnalyticsData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateRange, user]);

  const formatCurrency = (amount: number) => {
    const currency = (businessData as any)?.currency || 'USD';
    console.log('ReportsAnalytics formatting currency:', amount, 'using currency:', currency);
    
    const currencySymbols: { [key: string]: string } = {
      'NGN': '₦',
      'GHS': '₵', 
      'KES': 'KSh',
      'ZAR': 'R',
      'USD': '$',
      'GBP': '£',
      'CAD': 'C$'
    };
    
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const chartConfig = {
    revenue: {
      label: "Revenue", 
      color: "#39FF14",
    },
    bookings: {
      label: "Bookings",
      color: "#3b82f6",
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded-xs w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded-xs w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48 bg-card border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(overviewStats?.totalRevenue || 0)}
                </p>
                <div className="flex items-center mt-1">
                  {(overviewStats?.revenueGrowth || 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                  )}
                  <span className={`text-sm ${
                    (overviewStats?.revenueGrowth || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {Math.abs(overviewStats?.revenueGrowth || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-[#39FF14] [.light_&]:text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Bookings</p>
                <p className="text-2xl font-bold text-foreground">{overviewStats?.totalBookings || 0}</p>
                <div className="flex items-center mt-1">
                  {(overviewStats?.bookingGrowth || 0) >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                  )}
                  <span className={`text-sm ${
                    (overviewStats?.bookingGrowth || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {Math.abs(overviewStats?.bookingGrowth || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Avg Booking Value</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(overviewStats?.averageBookingValue || 0)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Per completed booking</p>
              </div>
              <Star className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Completion Rate</p>
                <p className="text-2xl font-bold text-foreground">
                  {(overviewStats?.completionRate || 0).toFixed(1)}%
                </p>
                <p className="text-sm text-red-400 mt-1">
                  {(overviewStats?.cancellationRate || 0).toFixed(1)}% cancelled
                </p>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <div className="overflow-x-auto scrollbar-hide">
          <TabsList className="bg-card border border-border inline-flex w-max">
            <TabsTrigger 
              value="revenue" 
              className="text-foreground data-[state=active]:bg-[#39FF14] data-[state=active]:text-black whitespace-nowrap px-6 py-2 flex-shrink-0 [.light_&]:data-[state=active]:bg-black [.light_&]:data-[state=active]:text-white"
            >
              Revenue Trends
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="text-foreground data-[state=active]:bg-[#39FF14] data-[state=active]:text-black whitespace-nowrap px-6 py-2 flex-shrink-0 [.light_&]:data-[state=active]:bg-black [.light_&]:data-[state=active]:text-white"
            >
              Service Performance
            </TabsTrigger>
            <TabsTrigger 
              value="staff" 
              className="text-foreground data-[state=active]:bg-[#39FF14] data-[state=active]:text-black whitespace-nowrap px-6 py-2 flex-shrink-0 [.light_&]:data-[state=active]:bg-black [.light_&]:data-[state=active]:text-white"
            >
              Staff Performance
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="revenue">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Revenue & Bookings Over Time</CardTitle>
              <CardDescription className="text-muted-foreground">
                Daily revenue and booking counts for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={800} minHeight={800}>
                  <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      className="text-xs sm:text-sm"
                    />
                    <YAxis 
                      yAxisId="revenue"
                      orientation="left"
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                      className="text-xs sm:text-sm"
                    />
                    <YAxis 
                      yAxisId="bookings"
                      orientation="right"
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      className="text-xs sm:text-sm"
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      yAxisId="revenue"
                      dataKey="revenue" 
                      fill="#39FF14" 
                      name="Revenue"
                      radius={[4, 4, 0, 0]}
                      minPointSize={2}
                      barSize={140}
                    />
                    <Line 
                      yAxisId="bookings"
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Bookings"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Service Revenue</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Revenue breakdown by service type
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="w-full" style={{ height: '300px' }}>
                  <ChartContainer config={chartConfig} className="w-full h-full">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={serviceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="revenue"
                        >
                          {serviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-popover border border-border rounded-xs p-2">
                                  <p className="text-popover-foreground font-medium">{data.name}</p>
                                  <p className="text-[#39FF14] [.light_&]:text-green-500">Revenue: {formatCurrency(data.revenue)}</p>
                                  <p className="text-blue-400">Bookings: {data.count}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Service Statistics</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Detailed breakdown of service performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceData.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: service.color }}
                        />
                        <div>
                          <p className="text-foreground font-medium">{service.name}</p>
                          <p className="text-muted-foreground text-sm">{service.count} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-foreground font-medium">{formatCurrency(service.revenue)}</p>
                        <p className="text-muted-foreground text-sm">
                          {formatCurrency(service.revenue / service.count)} avg
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="staff">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Staff Performance</CardTitle>
              <CardDescription className="text-muted-foreground">
                Revenue and booking statistics by staff member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={staffData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      type="number"
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name"
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af' }}
                      width={100}
                    />
                    <ChartTooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-popover border border-border rounded-xs p-2">
                              <p className="text-popover-foreground font-medium">{label}</p>
                              <p className="text-[#39FF14] [.light_&]:text-green-500">Revenue: {formatCurrency(payload[0].value as number)}</p>
                              <p className="text-blue-400">Bookings: {payload[0].payload.bookings}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#39FF14"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsAnalytics;
