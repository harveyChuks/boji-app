
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Clock, Lightbulb } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SERVICE_TYPES, SERVICE_SUGGESTIONS } from "@/utils/serviceSuggestions";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  service_type: string | null;
}

const ServicesManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [userBusiness, setUserBusiness] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
    service_type: ""
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchBusinessAndServices();
  }, [user]);

  // Listen for business profile updates
  useEffect(() => {
    const handleBusinessUpdate = () => {
      fetchBusinessAndServices();
    };

    // Listen for custom business update events
    window.addEventListener('businessProfileUpdated', handleBusinessUpdate);
    
    // Also listen for storage changes (in case multiple tabs are open)
    window.addEventListener('storage', handleBusinessUpdate);

    return () => {
      window.removeEventListener('businessProfileUpdated', handleBusinessUpdate);
      window.removeEventListener('storage', handleBusinessUpdate);
    };
  }, []);

  const fetchBusinessAndServices = async () => {
    if (!user) return;

    try {
      // Get user's business
      const { data: business } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (business) {
        setUserBusiness(business);
        
        // Get services
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .eq('business_id', business.id)
          .order('created_at', { ascending: false });
        
        setServices((servicesData || []) as any);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Currency formatting function (memoized for performance)
  const formatCurrency = useMemo(() => {
    return (amount: number) => {
      const currency = (userBusiness as any)?.currency || 'USD';
      
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
  }, [userBusiness]);

  const getCurrencyLabel = () => {
    const currency = (userBusiness as any)?.currency || 'USD';
    const currencyLabels: { [key: string]: string } = {
      'NGN': 'Price (₦)',
      'GHS': 'Price (₵)', 
      'KES': 'Price (KSh)',
      'ZAR': 'Price (R)',
      'USD': 'Price ($)',
      'GBP': 'Price (£)',
      'CAD': 'Price (C$)'
    };
    
    return currencyLabels[currency] || 'Price ($)';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userBusiness) return;

    setLoading(true);
    try {
      const serviceData = {
        business_id: userBusiness.id,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
        is_active: true,
        service_type: formData.service_type || null
      };

      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', editingService.id);

        if (error) throw error;

        toast({
          title: "Service Updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        // Create new service
        const { error } = await supabase
          .from('services')
          .insert(serviceData);

        if (error) throw error;

        toast({
          title: "Service Added",
          description: `${formData.name} has been added to your services.`,
        });
      }

      // Reset form and close modal
      setFormData({ name: "", description: "", price: "", duration_minutes: "", service_type: "" });
      setEditingService(null);
      setShowModal(false);
      setShowSuggestions(false);
      fetchBusinessAndServices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price?.toString() || "",
      duration_minutes: service.duration_minutes.toString(),
      service_type: service.service_type || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: false })
        .eq('id', serviceId);

      if (error) throw error;

      toast({
        title: "Service Deleted",
        description: "Service has been deactivated successfully.",
      });

      fetchBusinessAndServices();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openNewServiceModal = () => {
    setEditingService(null);
    setFormData({ name: "", description: "", price: "", duration_minutes: "", service_type: "" });
    setShowSuggestions(false);
    setShowModal(true);
  };

  const handleServiceTypeChange = (value: string) => {
    handleInputChange("service_type", value);
    setShowSuggestions(true); // Auto-show suggestions when service type is selected
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleInputChange("name", suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={openNewServiceModal} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.filter(service => service.is_active).map((service) => (
          <Card key={service.id} className="bg-card border-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-foreground text-lg">{service.name}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {service.description}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                    className="border-border text-foreground hover:bg-muted"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-foreground font-semibold">{formatCurrency(service.price)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-muted-foreground">{service.duration_minutes}min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.filter(service => service.is_active).length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No services added yet</p>
            <Button onClick={openNewServiceModal} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Service
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Service Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-card border-border text-foreground h-[90vh] flex flex-col p-0">
          <div className="flex-shrink-0 p-6 pb-4">
            <DialogHeader>
              <DialogTitle>
                {editingService ? "Edit Service" : "Add New Service"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingService ? "Update your service details" : "Add a new service to your business"}
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type</Label>
                <Select value={formData.service_type} onValueChange={handleServiceTypeChange}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border max-h-[300px] z-50">
                    {SERVICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="text-foreground hover:bg-accent">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="bg-input border-border text-foreground"
                  placeholder="Haircut & Style"
                  required
                />
                {formData.service_type && SERVICE_SUGGESTIONS[formData.service_type] && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {SERVICE_SUGGESTIONS[formData.service_type]!
                      .filter(suggestion => 
                        suggestion.toLowerCase().includes(formData.name.toLowerCase())
                      )
                      .map((suggestion) => (
                        <Badge
                          key={suggestion}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <Plus className="w-3 h-3" />
                          {suggestion}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="bg-input border-border text-foreground"
                  placeholder="Professional haircut and styling service"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">{getCurrencyLabel()}</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="bg-input border-border text-foreground"
                    placeholder="25.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => handleInputChange("duration_minutes", e.target.value)}
                    className="bg-input border-border text-foreground"
                    placeholder="30"
                    required
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex-shrink-0 flex-col sm:flex-row gap-2 p-6 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                className="border-border text-foreground hover:bg-muted w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
              >
                {loading ? "Saving..." : editingService ? "Update Service" : "Add Service"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesManagement;
