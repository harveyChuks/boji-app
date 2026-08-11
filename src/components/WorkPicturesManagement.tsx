
import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Camera, Trash2, Edit3, Save, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/utils/imageUpload";

interface WorkPicture {
  id: string;
  image_url: string;
  description: string | null;
  service_type: string | null;
  created_at: string;
}

const WorkPicturesManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [business, setBusiness] = useState<any>(null);
  const [workPictures, setWorkPictures] = useState<WorkPicture[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ description: "", service_type: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock pictures for initial display
  const mockPictures = [
    {
      id: 'mock-1',
      image_url: 'https://images.unsplash.com/photo-1622287162716-f311baa1a2b8?w=400&h=400&fit=crop',
      description: 'Modern fade haircut with clean lines',
      service_type: 'Haircut',
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-2', 
      image_url: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=400&fit=crop',
      description: 'Classic beard trim and styling',
      service_type: 'Beard Styling',
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-3',
      image_url: 'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=400&h=400&fit=crop',
      description: 'Professional business cut',
      service_type: 'Haircut',
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-4',
      image_url: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&h=400&fit=crop',
      description: 'Creative hair color and styling',
      service_type: 'Hair Color',
      created_at: new Date().toISOString()
    }
  ];

  useEffect(() => {
    fetchBusinessAndPictures();
  }, [user]);

  const fetchBusinessAndPictures = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (businessError) throw businessError;
      if (!businessData) return;
      setBusiness(businessData);

      const { data: picturesData, error: picturesError } = await supabase
        .from('work_pictures')
        .select('*')
        .eq('business_id', businessData.id)
        .order('created_at', { ascending: false });

      if (picturesError) throw picturesError;

      // If no real pictures, show mock data
      if (!picturesData || picturesData.length === 0) {
        setWorkPictures(mockPictures);
      } else {
        setWorkPictures(picturesData as any);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Show mock data on error
      setWorkPictures(mockPictures);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !business || !user) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file, 'work-pictures', `${user.id}/${business.id}/${Date.now()}`);
      
      const { data, error } = await supabase
        .from('work_pictures')
        .insert({
          business_id: business.id,
          image_url: imageUrl,
          description: 'New work sample',
          service_type: 'General'
        })
        .select()
        .single();

      if (error) throw error;

      setWorkPictures(prev => [data as any, ...prev.filter(p => !p.id.startsWith('mock-'))]);
      
      toast({
        title: "Image Uploaded",
        description: "Your work picture has been added successfully.",
      });
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

  const handleEdit = (picture: WorkPicture) => {
    setEditingId(picture.id);
    setEditForm({
      description: picture.description || "",
      service_type: picture.service_type || ""
    });
  };

  const handleSaveEdit = async (pictureId: string) => {
    if (!business || pictureId.startsWith('mock-')) return;

    try {
      const { error } = await supabase
        .from('work_pictures')
        .update({
          description: editForm.description,
          service_type: editForm.service_type
        })
        .eq('id', pictureId);

      if (error) throw error;

      setWorkPictures(prev => prev.map(p => 
        p.id === pictureId 
          ? { ...p, description: editForm.description, service_type: editForm.service_type }
          : p
      ));

      setEditingId(null);
      toast({
        title: "Updated",
        description: "Work picture details updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (pictureId: string) => {
    if (pictureId.startsWith('mock-')) {
      setWorkPictures(prev => prev.filter(p => p.id !== pictureId));
      return;
    }

    try {
      const { error } = await supabase
        .from('work_pictures')
        .delete()
        .eq('id', pictureId);

      if (error) throw error;

      setWorkPictures(prev => prev.filter(p => p.id !== pictureId));
      
      toast({
        title: "Deleted",
        description: "Work picture removed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Work Portfolio</CardTitle>
              <CardDescription className="text-muted-foreground">
                Showcase your best work to attract clients
              </CardDescription>
            </div>
            <Button
              onClick={handleImageUpload}
              disabled={uploading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              {uploading ? "Uploading..." : "Add Picture"}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted rounded-lg h-64 animate-pulse"></div>
              ))}
            </div>
          ) : workPictures.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Work Pictures</h3>
              <p className="text-muted-foreground mb-4">Start building your portfolio by adding pictures of your work.</p>
              <Button
                onClick={handleImageUpload}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Picture
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workPictures.map((picture) => (
                <Card key={picture.id} className="bg-card border-border overflow-hidden">
                  <div className="relative aspect-square">
                    <img
                      src={picture.image_url}
                      alt={picture.description || "Work sample"}
                      className="w-full h-full object-cover"
                    />
                    {picture.id.startsWith('mock-') && (
                      <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                        Sample
                      </Badge>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(picture)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(picture.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-3">
                    {editingId === picture.id ? (
                      <div className="space-y-2">
                        <div>
                          <Label htmlFor="description" className="text-xs">Description</Label>
                          <Textarea
                            id="description"
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            className="bg-input border-border text-foreground text-sm"
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label htmlFor="service_type" className="text-xs">Service Type</Label>
                          <Input
                            id="service_type"
                            value={editForm.service_type}
                            onChange={(e) => setEditForm(prev => ({ ...prev, service_type: e.target.value }))}
                            className="bg-input border-border text-foreground text-sm"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(picture.id)}
                            className="bg-green-600 hover:bg-green-700 text-white flex-1"
                          >
                            <Save className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            className="border-border text-foreground hover:bg-muted flex-1"
                          >
                            <X className="w-3 h-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-foreground text-sm font-medium mb-1">
                          {picture.description || "No description"}
                        </p>
                        {picture.service_type && (
                          <Badge variant="secondary" className="text-xs">
                            {picture.service_type}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkPicturesManagement;
