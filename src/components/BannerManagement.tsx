import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadImage, deleteImage } from "@/utils/imageUpload";

const BannerManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [business, setBusiness] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchBusiness();
  }, [user]);

  const fetchBusiness = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (data) {
        setBusiness(data);
        setBannerUrl(data.banner_url);
      }
    } catch (error) {
      console.error('Error fetching business:', error);
    }
  };

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !business || !user) return;

    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload to work-pictures bucket with same path pattern as work pictures
      const path = `${user.id}/${business.id}/banner-${Date.now()}`;
      const publicUrl = await uploadImage(file, 'work-pictures', path);

      // Update business record
      const { error } = await supabase
        .from('businesses')
        .update({ banner_url: publicUrl })
        .eq('id', business.id);

      if (error) throw error;

      setBannerUrl(publicUrl);
      toast({
        title: "Banner Updated",
        description: "Your business banner has been updated successfully.",
      });

      // Trigger business update event
      window.dispatchEvent(new Event('businessProfileUpdated'));
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleBannerRemove = async () => {
    if (!business || !bannerUrl) return;

    try {
      // Update business record to remove banner
      const { error } = await supabase
        .from('businesses')
        .update({ banner_url: null })
        .eq('id', business.id);

      if (error) throw error;

      setBannerUrl(null);
      toast({
        title: "Banner Removed",
        description: "Your business banner has been removed.",
      });

      // Trigger business update event
      window.dispatchEvent(new Event('businessProfileUpdated'));
    } catch (error: any) {
      toast({
        title: "Remove Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Business Banner</CardTitle>
        <CardDescription className="text-muted-foreground">
          Upload a rectangular banner image to showcase on your booking page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {bannerUrl ? (
          <div className="relative w-full aspect-[3/1] rounded-lg overflow-hidden bg-muted">
            <img 
              src={bannerUrl} 
              alt="Business banner" 
              className="w-full h-full object-cover"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleBannerRemove}
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="w-full aspect-[3/1] rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center gap-2">
            <ImageIcon className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No banner uploaded yet</p>
          </div>
        )}

        <div>
          <Label htmlFor="banner-upload" className="cursor-pointer">
            <div className="flex items-center justify-center w-full">
              <Button 
                type="button" 
                disabled={uploading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading..." : bannerUrl ? "Change Banner" : "Upload Banner"}
                </span>
              </Button>
            </div>
            <Input
              id="banner-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
              disabled={uploading}
            />
          </Label>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Recommended size: 1200x400px (3:1 ratio). Max 5MB.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BannerManagement;
