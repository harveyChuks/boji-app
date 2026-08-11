
import { useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRegistrationForm } from "./hooks/useRegistrationForm";
import StepIndicator from "./StepIndicator";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import BusinessInfoStep from "./steps/BusinessInfoStep";
import ProfessionalProfileStep from "./steps/ProfessionalProfileStep";
import ServicesStep from "./steps/ServicesStep";

interface MultiStepRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBusinessCreated?: () => void;
}

const MultiStepRegistrationModal = ({ open, onOpenChange, onBusinessCreated }: MultiStepRegistrationModalProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const {
    currentStep,
    personalInfo,
    businessInfo,
    professionalProfile,
    services,
    setPersonalInfo,
    setBusinessInfo,
    setProfessionalProfile,
    setServices,
    handleNext,
    handlePrevious,
    isStepValid,
    resetForm
  } = useRegistrationForm();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create a business");
      }

      // Create business
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: businessInfo.businessName,
          business_type: businessInfo.businessType,
          description: professionalProfile.bio,
          address: `${businessInfo.streetAddress}, ${businessInfo.city}, ${businessInfo.state} ${businessInfo.zipCode}`,
          phone: personalInfo.phone,
          email: personalInfo.email,
          owner_id: user.id,
          city: businessInfo.city,
          state: businessInfo.state,
          country: businessInfo.country,
          postal_code: businessInfo.zipCode,
          currency: businessInfo.currency
        })
        .select()
        .single();

      if (businessError) throw businessError;

      // Create services
      const validServices = services.filter(service => service.name && service.price);
      if (validServices.length > 0) {
        const { error: servicesError } = await supabase
          .from('services')
          .insert(
            validServices.map(service => ({
              business_id: business.id,
              name: service.name,
              price: parseFloat(service.price),
              duration_minutes: typeof service.duration === 'number' ? service.duration : (parseInt(service.duration) || 30)
            }))
          );

        if (servicesError) throw servicesError;
      }

      toast({
        title: "Business Created!",
        description: `${businessInfo.businessName} has been successfully registered.`,
      });
      
      resetForm();
      onOpenChange(false);
      onBusinessCreated?.();
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep 
            personalInfo={personalInfo} 
            setPersonalInfo={setPersonalInfo} 
          />
        );
      case 2:
        return (
          <BusinessInfoStep 
            businessInfo={businessInfo} 
            setBusinessInfo={setBusinessInfo} 
          />
        );
      case 3:
        return (
          <ProfessionalProfileStep 
            professionalProfile={professionalProfile} 
            setProfessionalProfile={setProfessionalProfile} 
          />
        );
      case 4:
        return (
          <ServicesStep 
            services={services} 
            setServices={setServices} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl h-[90vh] flex flex-col p-0">
        <div className="flex-shrink-0 p-6 pb-4">
          <DialogHeader>
            <DialogTitle>Register Your Business</DialogTitle>
            <DialogDescription className="text-slate-400">
              Complete your business profile in 4 simple steps
            </DialogDescription>
          </DialogHeader>
          
          <StepIndicator currentStep={currentStep} totalSteps={4} />
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {renderStepContent()}
        </div>
        
        <div className="flex-shrink-0 flex justify-between gap-3 p-6 pt-4 border-t border-slate-700 bg-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? () => { onOpenChange(false); navigate('/'); } : handlePrevious}
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            {currentStep === 1 ? 'Back to Landing Page' : 'Previous'}
          </Button>
          
          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !isStepValid()}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              {loading ? "Creating..." : "Complete Registration"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MultiStepRegistrationModal;
