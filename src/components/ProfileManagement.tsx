
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Save, Copy, ExternalLink, Check, QrCode, Download } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/utils/imageUpload";
import QRCode from "qrcode";
import { getBookingUrl } from "@/utils/publicUrl";
import { BUSINESS_TYPES, BusinessType } from "@/utils/businessTypes";

const ProfileManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [business, setBusiness] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    business_type: "" as BusinessType,
    phone: "",
    email: "",
    address: "",
    website: "",
    instagram: "",
    tiktok: "",
    logo_url: "",
    country: "Nigeria",
    currency: "NGN",
    state: ""
  });

  useEffect(() => {
    fetchBusinessProfile();
  }, [user]);

  // Generate QR code when business data is available
  useEffect(() => {
    if (business?.booking_link) {
      generateQRCode();
    }
  }, [business]);

  const generateQRCode = async () => {
    if (!business?.booking_link) return;
    
    const bookingUrl = getBookingUrl(business.booking_link);
    
    try {
      const qrDataUrl = await QRCode.toDataURL(bookingUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl || !business?.name) return;
    
    const link = document.createElement('a');
    link.download = `${business.name}-booking-qr.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "QR Code Downloaded",
      description: "Your booking QR code has been downloaded successfully.",
    });
  };

  const fetchBusinessProfile = async () => {
    if (!user) return;

    try {
      console.log('Fetching business profile for user:', user.id);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching business:', error);
        throw error;
      }

      if (data) {
        console.log('Business data fetched:', data);
        setBusiness(data);
        setFormData({
          name: data.name || "",
          description: data.description || "",
          business_type: data.business_type || "barbershop",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          website: data.website || "",
          instagram: data.instagram || "",
          tiktok: (data as any).tiktok || "",
          logo_url: data.logo_url || "",
          country: data.country || "Nigeria",
          currency: (data as any).currency || "NGN",
          state: data.state || ""
        });
      } else {
        console.log('No business found for user');
      }
    } catch (error) {
      console.error('Error fetching business profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBusinessTypeChange = (value: BusinessType) => {
    setFormData(prev => ({ ...prev, business_type: value }));
  };

  const countries = [
    { value: "Nigeria", label: "Nigeria", currency: "NGN" },
    { value: "Ghana", label: "Ghana", currency: "GHS" },
    { value: "Kenya", label: "Kenya", currency: "KES" },
    { value: "South Africa", label: "South Africa", currency: "ZAR" },
    { value: "United States", label: "United States", currency: "USD" },
    { value: "United Kingdom", label: "United Kingdom", currency: "GBP" },
    { value: "Canada", label: "Canada", currency: "CAD" }
  ];

  const statesByCountry = {
    "United States": [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", 
      "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", 
      "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", 
      "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", 
      "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", 
      "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", 
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", 
      "Wisconsin", "Wyoming"
    ],
    "Canada": [
      "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
      "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
      "Quebec", "Saskatchewan", "Yukon"
    ],
    "United Kingdom": [
      "England", "Scotland", "Wales", "Northern Ireland"
    ],
    "Nigeria": [
      "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
      "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa",
      "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger",
      "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
      "FCT Abuja"
    ],
    "Ghana": [
      "Ashanti", "Brong-Ahafo", "Central", "Eastern", "Greater Accra", "Northern",
      "Upper East", "Upper West", "Volta", "Western"
    ],
    "Kenya": [
      "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay",
      "Isiolo", "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii",
      "Kisumu", "Kitui", "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera",
      "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru", "Nandi",
      "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River",
      "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
    ],
    "South Africa": [
      "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo",
      "Mpumalanga", "Northern Cape", "North West", "Western Cape"
    ]
  };

  const getStatesForCountry = (country: string) => {
    return statesByCountry[country as keyof typeof statesByCountry] || [];
  };

  const handleCountryChange = (selectedCountry: string) => {
    const country = countries.find(c => c.value === selectedCountry);
    console.log('Country changed to:', selectedCountry, 'Currency:', country?.currency);
    setFormData(prev => ({ 
      ...prev, 
      country: selectedCountry,
      currency: country?.currency || "USD",
      state: "" // Reset state when country changes
    }));
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !business || !user) return;

    setUploadingImage(true);
    try {
      const logoUrl = await uploadImage(file, 'business-logos', `${user.id}/${business.id}`);
      
      setFormData(prev => ({ ...prev, logo_url: logoUrl }));
      
      // Update the database immediately
      const { error } = await supabase
        .from('businesses')
        .update({ logo_url: logoUrl })
        .eq('id', business.id);

      if (error) throw error;

      toast({
        title: "Logo Updated",
        description: "Your business logo has been uploaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const copyBookingLink = async () => {
    if (!business?.booking_link) return;
    
    const bookingUrl = getBookingUrl(business.booking_link);
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopiedLink(true);
      toast({
        title: "Booking Link Copied",
        description: "Your booking link has been copied to clipboard.",
      });
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy booking link. Please copy it manually.",
        variant: "destructive",
      });
    }
  };

  const openBookingPage = () => {
    if (!business?.booking_link) return;
    const bookingUrl = getBookingUrl(business.booking_link);
    window.open(bookingUrl, '_blank');
  };

  const handleSave = async () => {
    if (!business) return;

    setLoading(true);
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        business_type: formData.business_type,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        website: formData.website,
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        logo_url: formData.logo_url,
        country: formData.country,
        currency: formData.currency,
        state: formData.state
      } as any;

      console.log('Saving business data:', updateData);

      const { error } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', business.id);

      if (error) throw error;

      console.log('Business profile updated successfully');
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('businessProfileUpdated'));
      
      toast({
        title: "Profile Updated",
        description: "Your business profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error updating business profile:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  const bookingUrl = business.booking_link ? getBookingUrl(business.booking_link) : '';

  return (
    <div className="space-y-6">
      {/* Booking Link Section */}
      {business.booking_link && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Your Booking Link & QR Code</CardTitle>
            <CardDescription className="text-muted-foreground">
              Share this link or QR code with clients so they can book appointments online
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Link Section */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  value={bookingUrl}
                  readOnly
                  className="bg-input border-border text-foreground font-mono text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={copyBookingLink}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  onClick={openBookingPage}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>

            {/* QR Code Section */}
            {qrCodeDataUrl && (
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex flex-col items-center space-y-3">
                  <div className="bg-white p-4 rounded-lg">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Booking QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                  <Button
                    onClick={downloadQRCode}
                    variant="outline"
                    size="sm"
                    className="border-border text-foreground hover:bg-muted"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR
                  </Button>
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-foreground font-medium flex items-center">
                    <QrCode className="w-4 h-4 mr-2 text-primary [.light_&]:text-green-500" />
                    QR Code Instructions
                  </h4>
                  <ul className="text-muted-foreground text-sm space-y-1">
                    <li>• Print and display in your business</li>
                    <li>• Share on social media</li>
                    <li>• Include in business cards or flyers</li>
                    <li>• Clients can scan to book instantly</li>
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Business Profile Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Profile Settings</CardTitle>
          <CardDescription className="text-muted-foreground">
            Update your business details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Profile Photo Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={formData.logo_url} alt={formData.name} />
              <AvatarFallback className="bg-muted text-foreground text-lg">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'B'}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-2">
              <Button
                variant="outline"
                onClick={handleImageUpload}
                disabled={uploadingImage}
                className="border-border text-foreground hover:bg-muted"
              >
                <Camera className="w-4 h-4 mr-2" />
                {uploadingImage ? "Uploading..." : "Change Photo"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              {formData.name && (
                <p className="text-muted-foreground font-medium">{formData.name}</p>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-input border-border text-foreground"
                placeholder="Enter your business name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_type">Business Type</Label>
              <Select value={formData.business_type} onValueChange={handleBusinessTypeChange}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-60">
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="text-foreground hover:bg-accent">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="bg-input border-border text-foreground"
                placeholder="Business phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="bg-input border-border text-foreground"
                placeholder="Business email address"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="bg-input border-border text-foreground"
              rows={3}
              placeholder="Describe your business services and specialties"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className="bg-input border-border text-foreground"
              placeholder="Business address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                className="bg-input border-border text-foreground"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
                className="bg-input border-border text-foreground"
                placeholder="@yourbusiness"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                value={formData.tiktok}
                onChange={(e) => handleInputChange("tiktok", e.target.value)}
                className="bg-input border-border text-foreground"
                placeholder="@yourbusiness"
              />
            </div>

            <div className="space-y-2">
              {/* Empty div for grid alignment */}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={handleCountryChange}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border z-50 max-h-60">
                  {countries.map((country) => (
                    <SelectItem key={country.value} value={country.value} className="focus:bg-muted">
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={formData.currency}
                readOnly
                className="bg-muted border-border text-muted-foreground"
                placeholder="Auto-selected"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue placeholder="Select state/province" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border z-50 max-h-60">
                {getStatesForCountry(formData.country).map((state) => (
                  <SelectItem key={state} value={state} className="focus:bg-muted">
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;
