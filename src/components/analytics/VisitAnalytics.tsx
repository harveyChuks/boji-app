import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Smartphone, Monitor, Tablet, TrendingUp, MapPin, Globe } from 'lucide-react';

interface VisitStats {
  total_visits: number;
  unique_visits: number;
  mobile_visits: number;
  desktop_visits: number;
  tablet_visits: number;
  top_pages: Array<{ page_path: string; visits: number }>;
  daily_visits: Array<{ date: string; visits: number }>;
  top_countries: Array<{ country: string; visits: number }>;
  top_cities: Array<{ city: string; country: string; visits: number }>;
}

const VisitAnalytics = ({ businessId }: { businessId?: string }) => {
  const [stats, setStats] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7' | '30' | '90'>('30');

  const fetchVisitStats = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - parseInt(timeRange));

      // Build query based on whether we're viewing business-specific or admin stats
      let query = supabase
        .from('page_visits')
        .select('*')
        .gte('visit_date', startDate.toISOString().split('T')[0])
        .lte('visit_date', endDate.toISOString().split('T')[0]);

      // If businessId is provided, filter by business
      if (businessId) {
        query = query.eq('business_id', businessId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching visit stats:', error);
        return;
      }

      // Process the data
      const processedStats: VisitStats = {
        total_visits: data.length,
        unique_visits: data.filter(visit => visit.is_unique_visit).length,
        mobile_visits: data.filter(visit => visit.device_type === 'mobile').length,
        desktop_visits: data.filter(visit => visit.device_type === 'desktop').length,
        tablet_visits: data.filter(visit => visit.device_type === 'tablet').length,
        top_pages: [],
        daily_visits: [],
        top_countries: [],
        top_cities: []
      };

      // Calculate top pages
      const pageVisits = data.reduce((acc: Record<string, number>, visit) => {
        acc[visit.page_path] = (acc[visit.page_path] || 0) + 1;
        return acc;
      }, {});

      processedStats.top_pages = Object.entries(pageVisits)
        .map(([page_path, visits]) => ({ page_path, visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);

      // Calculate daily visits
      const dailyVisits = data.reduce((acc: Record<string, number>, visit) => {
        const date = visit.visit_date;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      processedStats.daily_visits = Object.entries(dailyVisits)
        .map(([date, visits]) => ({ date, visits }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate top countries
      const countryVisits = data.reduce((acc: Record<string, number>, visit) => {
        if (visit.country) {
          acc[visit.country] = (acc[visit.country] || 0) + 1;
        }
        return acc;
      }, {});

      processedStats.top_countries = Object.entries(countryVisits)
        .map(([country, visits]) => ({ country, visits }))
        .sort((a, b) => b.visits - a.visits);

      // Calculate top cities
      const cityVisits = data.reduce((acc: Record<string, { country: string; visits: number }>, visit) => {
        if (visit.city) {
          const key = `${visit.city}, ${visit.country || 'Unknown'}`;
          if (!acc[key]) {
            acc[key] = { country: visit.country || 'Unknown', visits: 0 };
          }
          acc[key].visits++;
        }
        return acc;
      }, {});

      processedStats.top_cities = Object.entries(cityVisits)
        .map(([city, data]) => ({ city, country: data.country, visits: data.visits }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 10);

      setStats(processedStats);
    } catch (error) {
      console.error('Error processing visit stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitStats();
  }, [timeRange, businessId]);

  const deviceData = stats ? [
    { name: 'Desktop', value: stats.desktop_visits, color: '#3b82f6' },
    { name: 'Mobile', value: stats.mobile_visits, color: '#10b981' },
    { name: 'Tablet', value: stats.tablet_visits, color: '#f59e0b' }
  ] : [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded-xs" />
        <div className="h-64 bg-muted animate-pulse rounded-xs" />
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">No visit data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Visit Analytics</h2>
          <p className="text-muted-foreground">Track your website traffic and engagement</p>
        </div>
        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as '7' | '30' | '90')}>
          <TabsList>
            <TabsTrigger value="7">7 days</TabsTrigger>
            <TabsTrigger value="30">30 days</TabsTrigger>
            <TabsTrigger value="90">90 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_visits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unique_visits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Visits</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.mobile_visits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desktop Visits</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.desktop_visits}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Daily Visits</CardTitle>
            <CardDescription>Visit trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.daily_visits}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Types</CardTitle>
            <CardDescription>Visits by device category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {deviceData.map((device) => (
                <div key={device.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: device.color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {device.name}: {device.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Visitors by country</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.top_countries.length > 0 ? (
                stats.top_countries.map((country, index) => (
                  <div key={country.country} className="flex items-center justify-between p-2 rounded-xs border">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{country.country}</span>
                    </div>
                    <Badge>{country.visits} visits</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No location data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Cities</CardTitle>
            <CardDescription>Visitors by city</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.top_cities.length > 0 ? (
                stats.top_cities.map((city, index) => (
                  <div key={city.city} className="flex items-center justify-between p-2 rounded-xs border">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{city.city}</span>
                    </div>
                    <Badge>{city.visits} visits</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No location data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>Most visited pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats.top_pages.map((page, index) => (
              <div key={page.page_path} className="flex items-center justify-between p-2 rounded-xs border">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{index + 1}</Badge>
                  <span className="font-medium">{page.page_path}</span>
                </div>
                <Badge>{page.visits} visits</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VisitAnalytics;