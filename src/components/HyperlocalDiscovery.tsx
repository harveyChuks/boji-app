import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, Phone, Navigation, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface NearbyBusiness {
  business_id: string;
  business_name: string;
  business_type: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  available_slots: number;
  logo_url: string;
}

const HyperlocalDiscovery = () => {
  const [nearbyBusinesses, setNearbyBusinesses] = useState<NearbyBusiness[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchRadius, setSearchRadius] = useState(10);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const { toast } = useToast();
  const { t } = useLanguage();

  const getBusinessTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      barbershop: '✂️',
      hair_salon: '💇',
      makeup_artist: '💄',
      nail_salon: '💅',
      spa: '🧖',
      beauty_clinic: '✨'
    };
    return icons[type] || '💼';
  };

  const getBusinessTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      barbershop: 'Barbershop',
      hair_salon: 'Hair Salon', 
      makeup_artist: 'Makeup Artist',
      nail_salon: 'Nail Salon',
      spa: 'Spa',
      beauty_clinic: 'Beauty Clinic'
    };
    return labels[type] || type;
  };

  const requestLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationPermission('denied');
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive",
          });
          setLoading(false);
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
      setLocationPermission('denied');
      setLoading(false);
    }
  };

  const searchNearbyBusinesses = async () => {
    if (!userLocation) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('find_nearby_businesses_with_slots', {
        user_lat: userLocation.lat,
        user_lon: userLocation.lng,
        search_radius: searchRadius,
        ...(selectedDate !== undefined ? { search_date: selectedDate } : {})
      });

      if (error) throw error;

      let filteredData = data || [];
      if (businessTypeFilter !== 'all') {
        filteredData = filteredData.filter((business: NearbyBusiness) => 
          business.business_type === businessTypeFilter
        );
      }

      setNearbyBusinesses(filteredData);
    } catch (error) {
      console.error('Error searching businesses:', error);
      toast({
        title: "Search Error",
        description: "Failed to find nearby businesses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      searchNearbyBusinesses();
    }
  }, [userLocation, searchRadius, selectedDate, businessTypeFilter]);

  const handleBookAppointment = (businessId: string, businessName: string) => {
    // Find the business booking link or redirect to booking page
    window.open(`/book/${businessId}`, '_blank');
  };

  if (locationPermission === 'pending') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-primary [.light_&]:text-green-500" />
          </div>
          <CardTitle className="text-2xl">Discover Nearby Businesses</CardTitle>
          <CardDescription>
            Find barbers, salons, and beauty clinics near you with available slots
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            onClick={requestLocation} 
            className="w-full" 
            disabled={loading}
          >
            <Navigation className="w-4 h-4 mr-2" />
            {loading ? 'Getting Location...' : 'Enable Location Access'}
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            We need your location to show nearby businesses with available appointment slots.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (locationPermission === 'denied') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl text-destructive">Location Access Denied</CardTitle>
          <CardDescription>
            To discover nearby businesses, please enable location access in your browser settings and refresh the page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button onClick={() => window.location.reload()} variant="outline">
            Refresh Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search Radius (km)</label>
              <Input
                type="number"
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                min="1"
                max="50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Business Type</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={businessTypeFilter}
                onChange={(e) => setBusinessTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="barbershop">Barbershops</option>
                <option value="hair_salon">Hair Salons</option>
                <option value="makeup_artist">Makeup Artists</option>
                <option value="nail_salon">Nail Salons</option>
                <option value="spa">Spas</option>
                <option value="beauty_clinic">Beauty Clinics</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            Nearby Businesses ({nearbyBusinesses.length})
          </h2>
          <Button 
            onClick={searchNearbyBusinesses} 
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Searching...' : 'Refresh'}
          </Button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Searching for nearby businesses...
            </div>
          </div>
        )}

        {!loading && nearbyBusinesses.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
              <p className="text-muted-foreground">
                Try increasing your search radius or changing the date.
              </p>
            </CardContent>
          </Card>
        )}

        {nearbyBusinesses.map((business) => (
          <Card key={business.business_id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={business.logo_url} alt={business.business_name} />
                    <AvatarFallback className="text-lg">
                      {getBusinessTypeIcon(business.business_type)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold truncate">{business.business_name}</h3>
                      <Badge variant="secondary" className="shrink-0">
                        {getBusinessTypeLabel(business.business_type)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{business.address}</span>
                        <Badge variant="outline" className="ml-auto shrink-0">
                          {business.distance_km.toFixed(1)} km
                        </Badge>
                      </div>
                      
                      {business.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 shrink-0" />
                          <span>{business.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>
                          {business.available_slots > 0 
                            ? `${business.available_slots} slots available` 
                            : 'No slots available'
                          }
                        </span>
                        <Badge 
                          variant={business.available_slots > 0 ? "default" : "secondary"}
                          className="ml-auto shrink-0"
                        >
                          {business.available_slots > 0 ? 'Available' : 'Fully Booked'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    onClick={() => handleBookAppointment(business.business_id, business.business_name)}
                    disabled={business.available_slots === 0}
                    size="sm"
                  >
                    Book Now
                  </Button>
                  {business.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${business.phone}`)}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HyperlocalDiscovery;