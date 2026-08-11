
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Clock, User, Calendar as CalendarIcon, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, endOfDay, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import AppointmentModal from "./AppointmentModal";

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  service: {
    name: string;
    duration_minutes: number;
  };
  staff?: {
    name: string;
  };
}

const CalendarView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);

  useEffect(() => {
    fetchBusinessAndAppointments();
  }, [user, selectedDate, viewMode]);

  // Auto-refresh appointments every 30 seconds to keep in sync
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBusinessAndAppointments();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchBusinessAndAppointments = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (businessError) throw businessError;
      if (!businessData) return;
      setBusiness(businessData);

      // Get appointments for selected date range based on view mode
      let startDate, endDate;
      
      if (viewMode === 'day') {
        startDate = startOfDay(selectedDate);
        endDate = endOfDay(selectedDate);
      } else if (viewMode === 'week') {
        startDate = startOfWeek(selectedDate);
        endDate = endOfWeek(selectedDate);
      } else { // month view
        startDate = startOfWeek(selectedDate);
        endDate = endOfWeek(addDays(selectedDate, 30));
      }

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services!inner(name, duration_minutes),
          staff(name)
        `)
        .eq('business_id', businessData.id)
        .gte('appointment_date', format(startDate, 'yyyy-MM-dd'))
        .lte('appointment_date', format(endDate, 'yyyy-MM-dd'))
        .order('start_time', { ascending: true });

      if (appointmentsError) throw appointmentsError;

      setAppointments((appointmentsData || []) as any);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500 hover:bg-emerald-600';
      case 'pending': return 'bg-amber-500 hover:bg-amber-600';
      case 'completed': return 'bg-blue-500 hover:bg-blue-600';
      case 'cancelled': return 'bg-red-500 hover:bg-red-600';
      case 'no_show': return 'bg-gray-500 hover:bg-gray-600';
      default: return 'bg-slate-500 hover:bg-slate-600';
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'day') {
      setSelectedDate(direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1));
    } else if (viewMode === 'week') {
      setSelectedDate(direction === 'prev' ? subDays(selectedDate, 7) : addDays(selectedDate, 7));
    } else {
      setSelectedDate(direction === 'prev' ? subDays(selectedDate, 30) : addDays(selectedDate, 30));
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate);
    const end = endOfWeek(selectedDate);
    return eachDayOfInterval({ start, end });
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => 
      format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  if (!business) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <p className="text-muted-foreground">No business profile found. Please register your business first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">Calendar</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your appointments</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex rounded-lg bg-card p-1">
            {['day', 'week', 'month'].map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode(mode as any)}
                className={`flex-1 sm:flex-none ${viewMode === mode 
                  ? "bg-[#39FF14] hover:bg-[#32E512] text-black [.light_&]:bg-black [.light_&]:text-white [.light_&]:hover:bg-black/90" 
                  : "text-foreground hover:bg-muted"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
          <Button 
            onClick={() => setShowNewAppointmentModal(true)}
            className="bg-[#39FF14] hover:bg-[#32E512] text-black text-sm sm:text-base [.light_&]:bg-black [.light_&]:text-white [.light_&]:hover:bg-black/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Mini Calendar */}
        <Card className="bg-card border-border xl:block hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground text-lg">Calendar</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border-0 w-full p-0"
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-xs bg-emerald-500"></div>
                <span className="text-muted-foreground">Confirmed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-xs bg-amber-500"></div>
                <span className="text-muted-foreground">Pending</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-xs bg-blue-500"></div>
                <span className="text-muted-foreground">Completed</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Calendar View */}
        <div className="xl:col-span-3">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-foreground text-lg sm:text-xl">
                    {viewMode === 'day' && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    {viewMode === 'week' && `Week of ${format(startOfWeek(selectedDate), 'MMM d')} - ${format(endOfWeek(selectedDate), 'MMM d, yyyy')}`}
                    {viewMode === 'month' && format(selectedDate, 'MMMM yyyy')}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm">
                    {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate('prev')}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                    className="border-border text-foreground hover:bg-muted px-2 sm:px-4 text-sm"
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate('next')}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">Loading appointments...</div>
                </div>
              ) : (
                <>
                  {/* Week View */}
                  {viewMode === 'week' && (
                    <div className="space-y-3 sm:space-y-4">
                      {getWeekDays().map((day) => {
                        const dayAppointments = getAppointmentsForDate(day);
                        const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                        
                        return (
                          <div key={day.toISOString()} className={`border-l-4 pl-3 sm:pl-4 py-2 ${isToday ? 'border-[#39FF14] bg-[#39FF14]/5 [.light_&]:border-green-500 [.light_&]:bg-green-500/5' : 'border-slate-600'}`}>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                              <h3 className={`font-semibold text-sm sm:text-base ${isToday ? 'text-[#39FF14] [.light_&]:text-green-500' : 'text-foreground'}`}>
                                {format(day, 'EEEE, MMM d')}
                                {isToday && <Badge className="ml-2 bg-[#39FF14] text-black text-xs [.light_&]:bg-black [.light_&]:text-white">Today</Badge>}
                              </h3>
                              <span className="text-muted-foreground text-xs sm:text-sm">
                                {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            
                            {dayAppointments.length === 0 ? (
                              <p className="text-muted-foreground text-xs sm:text-sm italic">No appointments scheduled</p>
                            ) : (
                              <div className="grid gap-2">
                                {dayAppointments.map((appointment) => (
                                  <div
                                    key={appointment.id}
                                    className="bg-muted border border-border rounded-lg p-2 sm:p-3 hover:bg-accent transition-colors cursor-pointer"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1">
                                          <Badge className={`${getStatusColor(appointment.status)} text-white text-xs w-fit`}>
                                            {appointment.status}
                                          </Badge>
                                          <div className="flex items-center text-muted-foreground text-xs sm:text-sm">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                                          </div>
                                        </div>
                                        <div className="flex items-center text-foreground font-medium mb-1 text-sm sm:text-base">
                                          <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                                          <span className="truncate">{appointment.customer_name}</span>
                                        </div>
                                        <div className="text-muted-foreground text-xs sm:text-sm">
                                          <span className="truncate">{appointment.service?.name}</span>
                                          {appointment.staff && (
                                            <span className="text-muted-foreground ml-2 hidden sm:inline">
                                              • {appointment.staff.name}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Day View */}
                  {viewMode === 'day' && (
                    <div className="space-y-3">
                      {appointments.length === 0 ? (
                        <div className="text-center py-8 sm:py-12">
                          <CalendarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No Appointments</h3>
                          <p className="text-muted-foreground text-sm sm:text-base">No appointments scheduled for this date.</p>
                        </div>
                      ) : (
                        appointments.map((appointment) => (
                          <Card key={appointment.id} className="bg-card border-border hover:bg-accent transition-colors cursor-pointer">
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                                    <Badge className={`${getStatusColor(appointment.status)} text-white text-xs w-fit`}>
                                      {appointment.status}
                                    </Badge>
                                    <div className="flex items-center text-muted-foreground text-sm">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                                    </div>
                                  </div>
                                  <div className="flex items-center text-foreground font-semibold mb-2 text-sm sm:text-base">
                                    <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                                    <span className="truncate">{appointment.customer_name}</span>
                                  </div>
                                  <div className="text-muted-foreground mb-1 text-sm">
                                    Service: <span className="truncate">{appointment.service?.name}</span>
                                    {appointment.service?.duration_minutes && (
                                      <span className="text-muted-foreground ml-2">
                                        ({appointment.service.duration_minutes} min)
                                      </span>
                                    )}
                                  </div>
                                  {appointment.staff && (
                                    <div className="text-muted-foreground text-sm">
                                      Staff: {appointment.staff.name}
                                    </div>
                                  )}
                                  {appointment.notes && (
                                    <div className="text-muted-foreground text-sm mt-2 italic">
                                      "{appointment.notes}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  )}

                  {/* Month View */}
                  {viewMode === 'month' && (
                    <div className="text-center py-8 sm:py-12">
                      <CalendarIcon className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">Month View</h3>
                      <p className="text-muted-foreground text-sm sm:text-base">Month view coming soon. Use day or week view for now.</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Appointment Modal */}
      <AppointmentModal
        open={showNewAppointmentModal}
        onOpenChange={setShowNewAppointmentModal}
        onAppointmentCreated={fetchBusinessAndAppointments}
      />
    </div>
  );
};

export default CalendarView;
