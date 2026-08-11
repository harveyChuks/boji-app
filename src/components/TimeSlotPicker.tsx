import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { useTimeSlots } from '@/hooks/useTimeSlots';

interface TimeSlotPickerProps {
  businessId: string;
  date: string;
  durationMinutes: number;
  staffId?: string;
  selectedTime: string;
  onTimeSelect: (time: string) => void;
}

const TimeSlotPicker = ({
  businessId,
  date,
  durationMinutes,
  staffId,
  selectedTime,
  onTimeSelect
}: TimeSlotPickerProps) => {
  const { timeSlots, loading, refetch } = useTimeSlots(businessId, date, durationMinutes, staffId);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for cache busting

  // Debug logging - simplified to avoid crashes
  console.log('TimeSlotPicker rendering with', timeSlots.length, 'slots');

  // Auto-refresh every 30 seconds to keep availability current
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshKey(prev => prev + 1); // Force component refresh
    await refetch();
    setRefreshing(false);
  };

  const handleTimeSelect = (time: string) => {
    // Clear previous selection first
    onTimeSelect("");
    // Then set new selection
    setTimeout(() => onTimeSelect(time), 100);
  };

  if (loading) {
    return (
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Clock className="w-4 h-4 mr-2 animate-spin" />
            <span className="text-slate-300">Loading available times...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <Card className="bg-slate-700/50 border-slate-600">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-slate-400">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>No available time slots for this date</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Safe filtering to prevent crashes - remove past slots and booked slots
  const availableSlots = timeSlots?.filter(s => {
    if (!s || !s.is_available) return false;
    
    // If selected date is today, filter out past time slots
    const today = new Date().toISOString().split('T')[0];
    if (date === today) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes(); // current time in minutes
      const [slotHours = 0, slotMinutes = 0] = s.slot_time.split(':').map(Number);
      const slotTimeInMinutes = slotHours * 60 + slotMinutes;
      
      // Filter out slots that are in the past
      if (slotTimeInMinutes <= currentTime) {
        return false;
      }
    }
    
    return true;
  }) || [];
  
  // Group slots by time of day
  const getTimeOfDay = (timeString: string) => {
    const hour = parseInt(timeString.split(':')[0] ?? '0');
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const slotsByTimeOfDay = {
    morning: timeSlots?.filter(s => s && getTimeOfDay(s.slot_time) === 'morning') || [],
    afternoon: timeSlots?.filter(s => s && getTimeOfDay(s.slot_time) === 'afternoon') || [],
    evening: timeSlots?.filter(s => s && getTimeOfDay(s.slot_time) === 'evening') || []
  };

  const getTimeOfDayStatus = (period: 'morning' | 'afternoon' | 'evening') => {
    const slots = slotsByTimeOfDay[period];
    const available = slots.filter(s => s.is_available);
    return {
      total: slots.length,
      available: available.length,
      fullyBooked: slots.length > 0 && available.length === 0
    };
  };

  const morningStatus = getTimeOfDayStatus('morning');
  const afternoonStatus = getTimeOfDayStatus('afternoon');
  const eveningStatus = getTimeOfDayStatus('evening');

  return (
    <div className="space-y-6" key={`timeslots-${refreshKey}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">Select Your Time</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-slate-400 hover:text-white"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Time of day status messages */}
      {(morningStatus.fullyBooked || afternoonStatus.fullyBooked || eveningStatus.fullyBooked) && (
        <div className="space-y-2">
          {morningStatus.fullyBooked && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm font-medium">☀️ Morning slots (before 12pm) are fully booked</p>
            </div>
          )}
          {afternoonStatus.fullyBooked && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm font-medium">🌤️ Afternoon slots (12pm-5pm) are fully booked</p>
            </div>
          )}
          {eveningStatus.fullyBooked && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm font-medium">🌙 Evening slots (after 5pm) are fully booked</p>
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-xs bg-green-500/20 border border-green-500/30"></div>
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-xs bg-amber-500 border border-amber-600"></div>
          <span className="text-slate-300">Selected</span>
        </div>
      </div>
      
      {/* Available Time Slots Grid - Only show available slots */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {availableSlots.map((slot) => {
          const formattedTime = formatTime(slot.slot_time);
          const isSelected = selectedTime === formattedTime;
          
          return (
            <Button
              key={slot.slot_time}
              variant="outline"
              size="sm"
              onClick={() => handleTimeSelect(formattedTime)}
              className={`relative h-12 transition-all duration-200 ${
                isSelected
                  ? "bg-amber-500 hover:bg-amber-600 text-black border-amber-600 shadow-lg scale-105"
                  : "border-green-500 bg-white dark:bg-green-500/10 text-foreground dark:text-white hover:bg-green-50 dark:hover:bg-green-500/20 hover:border-green-600 dark:hover:border-green-500/50 shadow-md dark:shadow-none"
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="font-medium">{formattedTime}</span>
                <span className="text-xs opacity-75">
                  {isSelected ? "Selected" : "Available"}
                </span>
              </div>
            </Button>
          );
        })}
      </div>
      
      {availableSlots.length === 0 && (
        <div className="text-center py-6">
          <div className="bg-slate-700/50 rounded-lg p-4">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-slate-400 font-medium">No available slots for this date</p>
            <p className="text-slate-500 text-sm mt-1">All time slots are currently booked</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotPicker;
