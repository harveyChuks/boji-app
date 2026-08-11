
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Staff {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  specialties: string[] | null;
  is_active: boolean;
  business_id: string;
}

const StaffManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [business, setBusiness] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    specialties: "",
    avatar_url: ""
  });

  useEffect(() => {
    fetchBusinessAndStaff();
  }, [user]);

  const fetchBusinessAndStaff = async () => {
    if (!user) return;

    try {
      // Get business first
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();

      if (businessError) throw businessError;
      if (!businessData) return;
      setBusiness(businessData);

      // Get staff for this business
      const { data: staffData, error: staffError } = await supabase
        .from('staff')
        .select('*')
        .eq('business_id', businessData.id)
        .order('created_at', { ascending: false });

      if (staffError) throw staffError;
      setStaff((staffData || []) as any);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!business || !formData.name.trim()) return;

    setLoading(true);
    try {
      const staffData = {
        name: formData.name.trim(),
        bio: formData.bio.trim() || null,
        specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : null,
        avatar_url: formData.avatar_url || null,
        business_id: business.id,
        is_active: true
      };

      if (editingStaff) {
        const { error } = await supabase
          .from('staff')
          .update(staffData)
          .eq('id', editingStaff.id);

        if (error) throw error;
        toast({ title: "Staff Updated", description: "Staff member has been updated successfully." });
      } else {
        const { error } = await supabase
          .from('staff')
          .insert([staffData]);

        if (error) throw error;
        toast({ title: "Staff Added", description: "New staff member has been added successfully." });
      }

      setDialogOpen(false);
      setEditingStaff(null);
      setFormData({ name: "", bio: "", specialties: "", avatar_url: "" });
      fetchBusinessAndStaff();
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

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      bio: staffMember.bio || "",
      specialties: staffMember.specialties?.join(', ') || "",
      avatar_url: staffMember.avatar_url || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = async (staffId: string) => {
    try {
      const { error } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffId);

      if (error) throw error;

      toast({ title: "Staff Deleted", description: "Staff member has been removed." });
      fetchBusinessAndStaff();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleStaffStatus = async (staffMember: Staff) => {
    try {
      const { error } = await supabase
        .from('staff')
        .update({ is_active: !staffMember.is_active })
        .eq('id', staffMember.id);

      if (error) throw error;

      toast({
        title: staffMember.is_active ? "Staff Deactivated" : "Staff Activated",
        description: `${staffMember.name} has been ${staffMember.is_active ? 'deactivated' : 'activated'}.`
      });
      fetchBusinessAndStaff();
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
      <div className="flex justify-end">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border h-[90vh] flex flex-col p-0">
            <div className="flex-shrink-0 p-6 pb-4">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Enter the staff member's information below.
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="bg-input border-border text-foreground"
                    placeholder="Staff member's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-foreground">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="bg-input border-border text-foreground"
                    placeholder="Brief description about the staff member"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialties" className="text-foreground">Specialties</Label>
                  <Input
                    id="specialties"
                    value={formData.specialties}
                    onChange={(e) => handleInputChange("specialties", e.target.value)}
                    className="bg-input border-border text-foreground"
                    placeholder="Haircuts, Beard trim, Styling (comma separated)"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t border-border">
              <DialogFooter>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !formData.name.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading ? "Saving..." : editingStaff ? "Update" : "Add Staff"}
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((staffMember) => (
          <Card key={staffMember.id} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={staffMember.avatar_url || ""} alt={staffMember.name} />
                  <AvatarFallback className="bg-muted text-foreground">
                    {staffMember.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-foreground truncate">{staffMember.name}</h3>
                    <Badge variant={staffMember.is_active ? "default" : "secondary"}>
                      {staffMember.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  {staffMember.bio && (
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{staffMember.bio}</p>
                  )}
                  {staffMember.specialties && staffMember.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {staffMember.specialties.slice(0, 3).map((specialty, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {staffMember.specialties.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{staffMember.specialties.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(staffMember)}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStaffStatus(staffMember)}
                      className="border-border text-foreground hover:bg-muted"
                    >
                      <User className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(staffMember.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {staff.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="p-8 text-center">
            <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Staff Members</h3>
            <p className="text-muted-foreground mb-4">Get started by adding your first team member.</p>
            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Staff Member
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StaffManagement;
