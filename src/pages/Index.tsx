
import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { Calendar, Users, Scissors, Clock, Plus, Search, LogOut, Building, BarChart3, Menu, ShieldCheck, User, Camera, TrendingUp, MessageCircle, CreditCard, Settings, Home, Briefcase, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ClientModal from "@/components/ClientModal";
import AppointmentModal from "@/components/AppointmentModal";
import AuthModal from "@/components/auth/AuthModal";
import MultiStepRegistrationModal from "@/components/business/MultiStepRegistrationModal";
import LandingPage from "@/components/LandingPage";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useTimeBasedTheme } from "@/hooks/useTimeBasedTheme";
import { usePasswordRecovery } from "@/hooks/usePasswordRecovery";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "@/lib/router-compat";
import StatisticsOverview from "@/components/StatisticsOverview";
import ProfileManagement from "@/components/ProfileManagement";
import ServicesManagement from "@/components/ServicesManagement";
import BookingsManagement from "@/components/BookingsManagement";
import SettingsSection from "@/components/SettingsSection";
import StaffManagement from "@/components/StaffManagement";
import CalendarView from "@/components/CalendarView";
import WorkPicturesManagement from "@/components/WorkPicturesManagement";
import BannerManagement from "@/components/BannerManagement";
import ReportsAnalytics from "@/components/ReportsAnalytics";
import WhatsAppIntegration from "@/components/WhatsAppIntegration";
import LocalPaymentsIntegration from "@/components/LocalPaymentsIntegration";
import { useBookingNotifications } from "@/hooks/useBookingNotifications";
import NewBookingAlert, { PendingBooking } from "@/components/NewBookingAlert";

// Currency formatting function
const formatCurrency = (amount: number, currency: string = 'NGN') => {
  const currencySymbols: { [key: string]: string } = {
    'NGN': '₦',
    'USD': '$',
    'GHS': '₵',
    'KES': 'KSh',
    'ZAR': 'R',
    'GBP': '£',
    'CAD': 'C$'
  };
  
  const symbol = currencySymbols[currency] || '$';
  return `${symbol}${amount.toLocaleString()}`;
};

const Index = () => {
  const { user, loading: authLoading, signOut, isAuthenticated } = useAuth();
  const { isAdmin } = useUserRole();
  
  // Apply time-based theme switching only for landing page visitors (non-authenticated users)
  const themeInfo = useTimeBasedTheme(!isAuthenticated);
  
  // State for business
  const [userBusiness, setUserBusiness] = useState(null);

  // Pop-up alert for new bookings needing confirmation
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null);
  const handleNewBooking = useCallback((booking: PendingBooking) => {
    setPendingBooking(booking);
  }, []);

  // Enable booking notifications for business owner
  useBookingNotifications(userBusiness?.id || null, handleNewBooking);
  
  // Handle password recovery redirects
  usePasswordRecovery();
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showClientModal, setShowClientModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBusinessModal, setShowBusinessModal] = useState(false);
  const isNativeMobile = Capacitor.isNativePlatform();

  // On mobile, auto-show auth modal when not authenticated
  useEffect(() => {
    if (isNativeMobile && !authLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isNativeMobile, authLoading, isAuthenticated]);
  const [activeSection, setActiveSection] = useState<string>('home');
  const [searchTerm, setSearchTerm] = useState("");
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalClients: 0,
    weeklyAppointments: 0,
    todayRevenue: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchUserBusiness = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setUserBusiness(data);
      
      // Debug log to check currency
      console.log('Business currency:', data?.currency);
    } catch (error: any) {
      console.error('Error fetching business:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!userBusiness) return;

    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's appointments with service details
      const { data: appointments } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            name,
            price
          )
        `)
        .eq('business_id', userBusiness.id)
        .eq('appointment_date', today);

      setTodayAppointments(appointments || []);

      // Fetch recent clients from customers who have appointments with this business
      const { data: clients } = await supabase
        .from('customers')
        .select(`
          *,
          appointments!inner (
            business_id
          )
        `)
        .eq('appointments.business_id', userBusiness.id)
        .order('created_at', { ascending: false })
        .limit(4);

      setRecentClients(clients || []);

      // Calculate total clients for this business
      const { count: totalClientsCount } = await supabase
        .from('appointments')
        .select('customer_id', { count: 'exact', head: true })
        .eq('business_id', userBusiness.id);

      // Get unique customer count for this business
      const { data: uniqueCustomers } = await supabase
        .from('appointments')
        .select('customer_id')
        .eq('business_id', userBusiness.id);
      
      const uniqueCustomerCount = new Set(uniqueCustomers?.map(a => a.customer_id)).size;

      // Calculate weekly appointments (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { count: weeklyCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', userBusiness.id)
        .gte('appointment_date', sevenDaysAgo)
        .neq('status', 'cancelled');

      // Calculate today's revenue from completed appointments
      const { data: todayCompletedAppointments } = await supabase
        .from('appointments')
        .select(`
          services (
            price
          )
        `)
        .eq('business_id', userBusiness.id)
        .eq('appointment_date', today)
        .eq('status', 'completed');

      const todayRevenue = todayCompletedAppointments?.reduce((total, appointment) => {
        return total + (appointment.services?.price || 0);
      }, 0) || 0;

      // Calculate this month's revenue
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
      
      const { data: monthlyCompletedAppointments } = await supabase
        .from('appointments')
        .select(`
          services (
            price
          )
        `)
        .eq('business_id', userBusiness.id)
        .gte('appointment_date', startOfMonthStr)
        .eq('status', 'completed');

      const monthlyRevenue = monthlyCompletedAppointments?.reduce((total, appointment) => {
        return total + (appointment.services?.price || 0);
      }, 0) || 0;

      setStats({
        todayAppointments: appointments?.length || 0,
        totalClients: uniqueCustomerCount,
        weeklyAppointments: weeklyCount || 0,
        todayRevenue: todayRevenue,
        monthlyRevenue: monthlyRevenue
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
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
    if (isAuthenticated) {
      fetchUserBusiness();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (userBusiness) {
      fetchDashboardData();

      // Set up real-time subscription for appointments
      const channel = supabase
        .channel('appointments-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'appointments',
            filter: `business_id=eq.${userBusiness.id}`
          },
          () => {
            // Refetch dashboard data when appointments change
            fetchDashboardData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userBusiness]);

  const filteredClients = recentClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSignOut = async () => {
    await signOut();
    setUserBusiness(null);
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  const handleAuthSuccess = () => {
    fetchUserBusiness();
  };

  const handleBusinessCreated = () => {
    fetchUserBusiness();
  };

  const MobileMenu = () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-primary/10 backdrop-blur-xl border-primary/20">
        <div className="flex flex-col pt-8 h-full overflow-y-auto pb-6">
          {isAuthenticated && userBusiness ? (
            <>
              <div className="text-white font-semibold mb-4 px-3">Business Management</div>
              
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setActiveSection('home')}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Home className="w-4 h-4 mr-3" />
                    Home
                  </button>
                </li>
                
                <li>
                  <button 
                    onClick={() => setActiveSection('overview')}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Overview
                  </button>
                </li>
                
                <li>
                  <button 
                    onClick={() => setActiveSection('reports')}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 mr-3" />
                    Biz Stats
                  </button>
                </li>
                
                <li>
                  <button 
                    onClick={() => setActiveSection('profile')}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Business Profile
                  </button>
                </li>
                
                <li>
                  <button 
                    onClick={() => setActiveSection('services')}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Scissors className="w-4 h-4 mr-3" />
                    Services
                  </button>
                </li>
                
                <li>
                  <button 
                    onClick={() => setActiveSection('portfolio')}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Camera className="w-4 h-4 mr-3" />
                    Portfolio
                  </button>
                </li>
                
                <li>
                  <button 
                    onClick={() => setActiveSection('staff')}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Users className="w-4 h-4 mr-3" />
                    Staff Management
                  </button>
                </li>
                
                <li>
                  <button 
                    onClick={() => setActiveSection('bookings')}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Calendar className="w-4 h-4 mr-3" />
                    Bookings
                  </button>
                </li>
                
                <li>
                  <button 
                    onClick={() => setActiveSection('calendar')}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Calendar className="w-4 h-4 mr-3" />
                    Calendar View
                  </button>
                </li>
                
                <li>
                  <button 
                    onClick={() => setActiveSection('whatsapp')}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 mr-3" />
                    WhatsApp Integration
                  </button>
                </li>
                
                <li>
                  <button 
                    onClick={() => setActiveSection('payments')}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <CreditCard className="w-4 h-4 mr-3" />
                    Local Payments
                  </button>
                </li>
                
                <li>
                  <button 
                    onClick={() => setActiveSection('settings')}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </button>
                </li>
              </ul>
              
              <div className="border-t border-slate-700 pt-4 mt-4">
                <ul className="space-y-2">
                  <li>
                    <button 
                      onClick={() => setShowAppointmentModal(true)}
                      className="w-full flex items-center px-3 py-3 rounded-lg transition-colors bg-[#39FF14] text-black hover:bg-[#32e612] [.light_&]:bg-black [.light_&]:text-white [.light_&]:hover:bg-black/90"
                    >
                      <Plus className="w-4 h-4 mr-3" />
                      New Appointment
                    </button>
                  </li>
                  
                  <li>
                    <button 
                      onClick={() => setShowClientModal(true)}
                      className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-3" />
                      Add Client
                    </button>
                  </li>
                </ul>
              </div>
            </>
          ) : isAuthenticated ? (
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setShowBusinessModal(true)}
                  className="w-full flex items-center px-3 py-3 rounded-lg transition-colors bg-[#39FF14] text-black hover:bg-[#32e612] [.light_&]:bg-black [.light_&]:text-white [.light_&]:hover:bg-black/90"
                >
                  <Building className="w-4 h-4 mr-3" />
                  Register Business
                </button>
              </li>
            </ul>
          ) : (
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full flex items-center px-3 py-3 rounded-lg transition-colors bg-[#39FF14] text-black hover:bg-[#32e612] [.light_&]:bg-black [.light_&]:text-white [.light_&]:hover:bg-black/90"
                >
                  Sign In / Sign Up
                </button>
              </li>
            </ul>
          )}
          
          <div className="border-t border-slate-700 pt-4 mt-4">
            <ul className="space-y-2">
              {isAdmin && (
                <li>
                  <button 
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 mr-3" />
                    Admin Panel
                  </button>
                </li>
              )}
              {isAuthenticated && (
                <li>
                  <button 
                    onClick={handleSignOut}
                    className="w-full flex items-center px-3 py-3 text-white hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-20 md:pb-0">
      {/* Mobile Bottom Navigation - Only for authenticated business owners */}
      {isAuthenticated && userBusiness && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
          <div className="grid grid-cols-5 gap-1 p-2">
            <button
              onClick={() => setActiveSection('home')}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
                activeSection === 'home' ? 'text-primary [.light_&]:text-green-500' : 'text-muted-foreground'
              }`}
            >
              <Home className="w-4 h-4 mb-1" />
              <span>Home</span>
            </button>
            <button
              onClick={() => setActiveSection('reports')}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
                activeSection === 'reports' ? 'text-primary [.light_&]:text-green-500' : 'text-muted-foreground'
              }`}
            >
              <BarChart3 className="w-4 h-4 mb-1" />
              <span>Stats</span>
            </button>
            <button
              onClick={() => setActiveSection('services')}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
                activeSection === 'services' ? 'text-primary [.light_&]:text-green-500' : 'text-muted-foreground'
              }`}
            >
              <Briefcase className="w-4 h-4 mb-1" />
              <span>Services</span>
            </button>
            <button
              onClick={() => setActiveSection('bookings')}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
                activeSection === 'bookings' ? 'text-primary [.light_&]:text-green-500' : 'text-muted-foreground'
              }`}
            >
              <Calendar className="w-4 h-4 mb-1" />
              <span>Bookings</span>
            </button>
            <button
              onClick={() => setActiveSection('profile')}
              className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs ${
                activeSection === 'profile' ? 'text-primary [.light_&]:text-green-500' : 'text-muted-foreground'
              }`}
            >
              <User className="w-4 h-4 mb-1" />
              <span>Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Three glowing colors - purple right, blue middle, light blue left - hidden in light mode */}
      <div className="fixed inset-0 pointer-events-none dark:block hidden">
        {/* Left corner - light blue */}
        <div 
          className="absolute bottom-0 left-0 w-[1000px] h-[1000px] rounded-full opacity-40 blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, #38b6ff 0%, transparent 70%)',
            transform: 'translate(-50%, 50%)'
          }}
        />
        {/* Middle - blue */}
        <div 
          className="absolute bottom-0 left-1/2 w-[1000px] h-[1000px] rounded-full opacity-35 blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, #5271ff 0%, transparent 70%)',
            transform: 'translate(-50%, 50%)'
          }}
        />
        {/* Right corner - purple */}
        <div 
          className="absolute bottom-0 right-0 w-[1000px] h-[1000px] rounded-full opacity-40 blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, #5e17eb 0%, transparent 70%)',
            transform: 'translate(50%, 50%)'
          }}
        />
      </div>

      {/* Header */}
      <header className="bg-black border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-24 md:h-28">
            {/* App Logo - Left */}
            <div className="flex items-center">
              <img 
                src="/boji-logo.png" 
                alt="bójí" 
                className="h-14 sm:h-16 md:h-20 w-auto"
              />
            </div>
            
            {/* Navigation Links - Center (Only show on landing page) */}
            {!isAuthenticated && (
              <nav className="hidden lg:flex items-center space-x-8 flex-1 justify-center">
                <a href="#about" className="text-slate-300 hover:text-white transition-colors">About</a>
                <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">Pricing</a>
                <a 
                  href="#faqs" 
                  onClick={(e) => {
                    e.preventDefault();
                    const faqsSection = document.getElementById('faqs');
                    faqsSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  FAQs
                </a>
              </nav>
            )}
            
            {/* Right Side Actions */}
            <div className="flex items-center gap-2 ml-4">
              {/* Top Action Buttons - Show when not authenticated */}
              {!isAuthenticated && (
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  size="default"
                  className="text-sm px-6 py-2 h-10 bg-white text-black hover:bg-white/90"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              
              {/* Desktop Menu - Show when authenticated */}
              {isAuthenticated && (
                <div className="hidden md:flex items-center space-x-4">
                  {isAdmin && (
                    <Button 
                      onClick={() => navigate('/admin')}
                      variant="outline"
                    >
                      <ShieldCheck className="w-4 h-4 mr-2" />
                      Admin Panel
                    </Button>
                  )}
                  {userBusiness ? (
                    <MobileMenu />
                  ) : (
                    <Button 
                      onClick={() => setShowBusinessModal(true)}
                      className="bg-[#39FF14] text-black hover:bg-[#32e612] [.light_&]:bg-black [.light_&]:text-white [.light_&]:hover:bg-black/90"
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Register Business
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Only for authenticated users with business */}
            {isAuthenticated && userBusiness && (
              <div className="md:hidden">
                <MobileMenu />
              </div>
            )}

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-4 py-4 sm:py-8 relative z-10">
        {!isAuthenticated ? (
          isNativeMobile ? (
            <div className="text-center py-12">
              <div className="text-white text-xl">Please sign in to continue</div>
            </div>
          ) : (
            <LandingPage onGetStarted={() => setShowAuthModal(true)} />
          )
        ) : !userBusiness ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 text-[#39FF14] [.light_&]:text-green-500" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Set Up Your Business</h2>
            <p className="text-slate-400 mb-8 max-w-2xl mx-auto px-4">
              Complete your business registration with our step-by-step process to start accepting bookings.
            </p>
            <Button 
              onClick={() => setShowBusinessModal(true)}
              className="text-lg px-8 py-3 bg-[#39FF14] text-black hover:bg-[#32e612] [.light_&]:bg-black [.light_&]:text-white [.light_&]:hover:bg-black/90"
            >
              <Building className="w-5 h-5 mr-2" />
              Complete Registration
            </Button>
          </div>
        ) : (
          <>
            {/* Quick Stats Grid - Only show on home and overview */}
            {(activeSection === 'home' || activeSection === 'overview') && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                <Card className="bg-card border-border hover:bg-accent transition-colors">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-xs sm:text-sm font-medium">Today's Appointments</p>
                        <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{stats.todayAppointments}</p>
                      </div>
                      <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border hover:bg-accent transition-colors">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-xs sm:text-sm font-medium">Total Clients</p>
                        <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{stats.totalClients}</p>
                      </div>
                      <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border hover:bg-accent transition-colors">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-xs sm:text-sm font-medium">This Week</p>
                        <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{stats.weeklyAppointments}</p>
                      </div>
                      <Scissors className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border hover:bg-accent transition-colors">
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-xs sm:text-sm font-medium">Revenue Today</p>
                        <p className="text-xl sm:text-3xl font-bold text-foreground mt-1 sm:mt-2">{formatCurrency(stats.todayRevenue, userBusiness?.currency || 'NGN')}</p>
                      </div>
                      <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === 'home' && (
              <>
                {/* Quick Actions */}
                <div className="mb-6 sm:mb-8">
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3 sm:pb-6">
                      <CardTitle className="text-foreground text-lg sm:text-xl">Quick Actions</CardTitle>
                      <CardDescription className="text-muted-foreground text-sm sm:text-base">
                        Access your most used features
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <Button 
                          onClick={() => setShowAppointmentModal(true)}
                          className="h-12 sm:h-16 text-sm sm:text-lg bg-[#39FF14] text-black hover:bg-[#32e612] [.light_&]:bg-black [.light_&]:text-white [.light_&]:hover:bg-black/90"
                        >
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Book Appointment
                        </Button>
                        <Button 
                          onClick={() => setShowClientModal(true)}
                          variant="outline"
                          className="h-12 sm:h-16 text-sm sm:text-lg"
                        >
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                          Add Client
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* Today's Appointments */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-foreground flex items-center text-lg sm:text-xl">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#39FF14] [.light_&]:text-green-500" />
                        Today's Appointments
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        {todayAppointments.length} appointments scheduled
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {todayAppointments.length > 0 ? (
                        <div className="space-y-3 sm:space-y-4">
                          {todayAppointments.slice(0, 3).map((appointment) => (
                            <div
                              key={appointment.id}
                              className="flex items-center justify-between p-3 sm:p-4 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm sm:text-base truncate">{appointment.customer_name}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground truncate">{appointment.services?.name || 'Service'}</p>
                              </div>
                              <Badge variant="outline" className="text-xs sm:text-sm ml-2 flex-shrink-0 border-[#39FF14] text-[#39FF14] [.light_&]:border-green-500 [.light_&]:text-green-500">
                                {appointment.start_time}
                              </Badge>
                            </div>
                          ))}
                          {todayAppointments.length > 3 && (
                              <Button
                                onClick={() => setActiveSection('bookings')}
                                variant="outline"
                                className="w-full text-sm sm:text-base"
                              >
                                View All ({todayAppointments.length})
                              </Button>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6 sm:py-8">
                          <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground text-sm sm:text-base">No appointments for today</p>
                          <Button
                            onClick={() => setShowAppointmentModal(true)}
                            className="mt-4 text-sm sm:text-base bg-[#39FF14] text-black hover:bg-[#32e612] [.light_&]:bg-black [.light_&]:text-white [.light_&]:hover:bg-black/90"
                          >
                            Schedule First Appointment
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Clients */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-foreground flex items-center text-lg sm:text-xl">
                        <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#39FF14] [.light_&]:text-green-500" />
                        Recent Clients
                      </CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">
                        Your client database
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                          <Input
                            placeholder="Search clients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-input border-border text-foreground placeholder-muted-foreground text-sm sm:text-base"
                          />
                        </div>
                        {filteredClients.length > 0 ? (
                          <div className="space-y-2 sm:space-y-3">
                            {filteredClients.slice(0, 4).map((client) => (
                              <div
                                key={client.id}
                                className="flex items-center justify-between p-2 sm:p-3 bg-accent/50 rounded-lg hover:bg-accent/70 transition-colors cursor-pointer"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground text-sm sm:text-base truncate">{client.name}</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{client.phone}</p>
                                </div>
                                <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                                  Recent
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 sm:py-8">
                            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground text-sm sm:text-base">
                              {searchTerm ? "No clients match your search" : "No clients yet"}
                            </p>
                            {!searchTerm && (
                              <Button
                                onClick={() => setShowClientModal(true)}
                                className="mt-4 text-sm sm:text-base bg-[#39FF14] text-black hover:bg-[#32e612] [.light_&]:bg-black [.light_&]:text-white [.light_&]:hover:bg-black/90"
                              >
                                Add First Client
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {activeSection === 'overview' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">Business Overview</h1>
                </div>
                <StatisticsOverview />
              </div>
            )}

            {activeSection === 'reports' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
                </div>
                <ReportsAnalytics />
              </div>
            )}

            {activeSection === 'profile' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">Business Profile</h1>
                </div>
                <ProfileManagement />
              </div>
            )}

            {activeSection === 'services' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">Services Management</h1>
                </div>
                <ServicesManagement />
              </div>
            )}

            {activeSection === 'portfolio' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">Portfolio Management</h1>
                </div>
                <div className="space-y-6">
                  <BannerManagement />
                  <WorkPicturesManagement />
                </div>
              </div>
            )}

            {activeSection === 'staff' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
                </div>
                <StaffManagement />
              </div>
            )}

            {activeSection === 'bookings' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">Bookings Management</h1>
                </div>
                <BookingsManagement />
              </div>
            )}

            {activeSection === 'calendar' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">Calendar View</h1>
                </div>
                <CalendarView />
              </div>
            )}

            {activeSection === 'whatsapp' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">WhatsApp Integration</h1>
                </div>
                <WhatsAppIntegration />
              </div>
            )}

            {activeSection === 'payments' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">Local Payments</h1>
                </div>
                <LocalPaymentsIntegration />
              </div>
            )}

            {activeSection === 'settings' && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                </div>
                <SettingsSection />
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <ClientModal 
        open={showClientModal} 
        onOpenChange={setShowClientModal}
        onClientAdded={() => {
          fetchUserBusiness();
          fetchDashboardData();
        }}
      />
      <AppointmentModal 
        open={showAppointmentModal} 
        onOpenChange={setShowAppointmentModal}
        onAppointmentCreated={() => {
          fetchDashboardData();
        }}
      />
      <AuthModal 
        open={showAuthModal} 
        onOpenChange={setShowAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
      <MultiStepRegistrationModal 
        open={showBusinessModal} 
        onOpenChange={setShowBusinessModal}
        onBusinessCreated={handleBusinessCreated}
      />
      <NewBookingAlert
        booking={pendingBooking}
        onClose={() => {
          setPendingBooking(null);
          fetchDashboardData();
        }}
      />
    </div>
  );
};

export default Index;
