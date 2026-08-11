import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Gift, LogOut, User, Phone, Mail, Star, X, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RescheduleDialog } from "@/components/RescheduleDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Appointment {
  id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  discount_percentage: number;
  discount_reason: string | null;
  final_price: number | null;
  service_id: string;
  business_id: string;
}

interface AppointmentWithDetails extends Appointment {
  service_name: string;
  service_price: number;
  business_name: string;
  business_address: string | null;
}

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, customerProfile, loading, signOut, isAuthenticated } = useCustomerAuth();
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentWithDetails | null>(null);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user && customerProfile) {
      fetchAppointments();
    }
  }, [user, customerProfile]);

  const fetchAppointments = async () => {
    if (!user || !customerProfile) return;

    try {
      // Fetch appointments by customer_id OR by email/phone for guest bookings
      const { data: appointmentsData, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services!inner(name, price),
          businesses!inner(name, address)
        `)
        .or(`customer_id.eq.${user.id},customer_email.eq.${customerProfile.email},customer_phone.eq.${customerProfile.phone}`)
        .order('appointment_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) throw error;

      const formattedAppointments = appointmentsData?.map(apt => ({
        ...apt,
        service_name: (apt.services as any).name,
        service_price: (apt.services as any).price,
        business_name: (apt.businesses as any).name,
        business_address: (apt.businesses as any).address,
      })) || [];

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load your bookings",
        variant: "destructive",
      });
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;

    try {
      const { error } = await supabase.functions.invoke('handle-booking-action', {
        body: {
          appointmentId: appointmentToCancel,
          action: 'cancel'
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Appointment cancelled successfully",
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive",
      });
    } finally {
      setIsCancelDialogOpen(false);
      setAppointmentToCancel(null);
    }
  };

  const handleRescheduleClick = (appointment: AppointmentWithDetails) => {
    setSelectedAppointment(appointment);
    setIsRescheduleOpen(true);
  };

  const handleCancelClick = (appointmentId: string) => {
    setAppointmentToCancel(appointmentId);
    setIsCancelDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">bójí</h1>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Summary */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {customerProfile?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl text-foreground">{customerProfile?.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    {customerProfile?.is_loyalty_member && (
                      <Badge variant="secondary" className="gap-1">
                        <Star className="w-3 h-3" />
                        Loyalty Member
                      </Badge>
                    )}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Contact Info */}
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{customerProfile?.phone}</span>
              </div>
              {customerProfile?.email && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{customerProfile.email}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{customerProfile?.total_bookings} Total Bookings</span>
              </div>
            </div>

            {/* Loyalty Benefits */}
            {customerProfile?.is_loyalty_member && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <Gift className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Your Benefits</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ✓ 3% discount on all bookings<br />
                      ✓ Follow businesses on social media for extra 2% discount<br />
                      ✓ Priority booking access
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bookings Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">My Bookings</CardTitle>
            <CardDescription className="text-muted-foreground">
              View and manage your appointment history
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAppointments ? (
              <div className="text-center py-8 text-muted-foreground">Loading bookings...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No bookings yet</p>
                <Button onClick={() => navigate('/')}>Browse Businesses</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-foreground">{appointment.business_name}</h3>
                        <p className="text-sm text-muted-foreground">{appointment.service_name}</p>
                      </div>
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(appointment.appointment_date), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {appointment.start_time} - {appointment.end_time}
                      </div>
                      {appointment.business_address && (
                        <div className="flex items-center gap-2 md:col-span-2">
                          <MapPin className="w-4 h-4" />
                          {appointment.business_address}
                        </div>
                      )}
                    </div>

                    {/* Discount Info */}
                    {appointment.discount_percentage > 0 && (
                      <div className="mt-3 p-2 bg-primary/5 border border-primary/20 rounded-xs text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            <Gift className="w-3 h-3 inline mr-1" />
                            {appointment.discount_reason}
                          </span>
                          <span className="font-semibold text-primary">
                            -{appointment.discount_percentage}%
                          </span>
                        </div>
                        {appointment.final_price && (
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-muted-foreground line-through">
                              ₦{appointment.service_price.toFixed(2)}
                            </span>
                            <span className="font-semibold text-foreground">
                              ₦{appointment.final_price.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {appointment.notes && (
                      <p className="mt-3 text-sm text-muted-foreground italic">
                        Note: {appointment.notes}
                      </p>
                    )}

                    {/* Action Buttons */}
                    {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRescheduleClick(appointment)}
                          className="gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelClick(appointment.id)}
                          className="gap-2 text-red-500 hover:text-red-600 border-red-500/20 hover:border-red-500/40"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reschedule Dialog */}
      {selectedAppointment && (
        <RescheduleDialog
          open={isRescheduleOpen}
          onOpenChange={(open) => {
            setIsRescheduleOpen(open);
            if (!open) setSelectedAppointment(null);
          }}
          appointmentId={selectedAppointment.id}
          currentDate={selectedAppointment.appointment_date}
          currentStartTime={selectedAppointment.start_time}
          currentEndTime={selectedAppointment.end_time}
          businessId={selectedAppointment.business_id}
          durationMinutes={(() => {
            const start = selectedAppointment.start_time.split(':').map(Number);
            const end = selectedAppointment.end_time.split(':').map(Number);
            return (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
          })()}
          onRescheduled={() => {
            fetchAppointments();
            setIsRescheduleOpen(false);
            setSelectedAppointment(null);
          }}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              className="bg-red-500 hover:bg-red-600"
            >
              Cancel Appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CustomerDashboard;
