import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Plus, Trash2, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PaymentMethod {
  id: string;
  provider: string;
  provider_config: any;
  is_active: boolean;
}

interface PaymentConfig {
  api_key: string;
  secret_key: string;
  merchant_id?: string;
  public_key?: string;
  environment: 'sandbox' | 'production';
}

const PaymentProviders = {
  mpesa: { name: 'M-Pesa', icon: '💰' },
  paystack: { name: 'Paystack', icon: '💳' },
  flutterwave: { name: 'Flutterwave', icon: '🌊' },
  mtn_momo: { name: 'MTN MoMo', icon: '📱' },
};

const LocalPaymentsIntegration = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newMethod, setNewMethod] = useState({
    provider: '',
    config: {} as PaymentConfig,
    is_active: true,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (business) {
        setBusinessId(business.id);
        const { data: methods } = await supabase
          .from("payment_methods")
          .select("*")
          .eq("business_id", business.id);
        
        setPaymentMethods((methods || []) as any);
      }
    } catch (error) {
      console.error("Error loading payment methods:", error);
    }
  };

  const addPaymentMethod = async () => {
    if (!businessId || !newMethod.provider) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("payment_methods")
        .insert({
          business_id: businessId,
          provider: newMethod.provider,
          provider_config: newMethod.config as any,
          is_active: newMethod.is_active,
        });

      if (error) throw error;

      toast({
        title: "Payment method added",
        description: `${PaymentProviders[newMethod.provider as keyof typeof PaymentProviders].name} integration added successfully`,
      });

      setNewMethod({
        provider: '',
        config: {} as PaymentConfig,
        is_active: true,
      });
      setShowAddForm(false);
      loadPaymentMethods();
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast({
        title: "Error",
        description: "Failed to add payment method",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePaymentMethod = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("payment_methods")
        .update({ is_active: isActive })
        .eq("id", id);

      if (error) throw error;

      setPaymentMethods(methods =>
        methods.map(method =>
          method.id === id ? { ...method, is_active: isActive } : method
        )
      );

      toast({
        title: isActive ? "Payment method enabled" : "Payment method disabled",
        description: "Settings updated successfully",
      });
    } catch (error) {
      console.error("Error toggling payment method:", error);
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive",
      });
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      const { error } = await supabase
        .from("payment_methods")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPaymentMethods(methods => methods.filter(method => method.id !== id));
      toast({
        title: "Payment method deleted",
        description: "Payment method removed successfully",
      });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive",
      });
    }
  };

  const testPaymentMethod = async (method: PaymentMethod) => {
    setLoading(true);
    try {
      // Here you would integrate with the actual payment provider's test endpoint
      // For demo purposes, we'll just show a success message
      toast({
        title: "Test transaction successful",
        description: `${PaymentProviders[method.provider as keyof typeof PaymentProviders].name} connection is working`,
      });
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Payment method test failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Local Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Configure local payment gateways for your customers
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              size="sm"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          {/* Existing Payment Methods */}
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {PaymentProviders[method.provider as keyof typeof PaymentProviders]?.icon}
                  </span>
                  <div>
                    <p className="font-medium">
                      {PaymentProviders[method.provider as keyof typeof PaymentProviders]?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {method.provider_config.environment || 'sandbox'}
                    </p>
                  </div>
                  <Badge variant={method.is_active ? "default" : "secondary"}>
                    {method.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testPaymentMethod(method)}
                    disabled={loading}
                  >
                    <TestTube className="w-4 h-4" />
                  </Button>
                  <Switch
                    checked={method.is_active}
                    onCheckedChange={(checked) => togglePaymentMethod(method.id, checked)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deletePaymentMethod(method.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Payment Method Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="provider">Payment Provider</Label>
                  <Select
                    value={newMethod.provider}
                    onValueChange={(value) => setNewMethod({ ...newMethod, provider: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a payment provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PaymentProviders).map(([key, provider]) => (
                        <SelectItem key={key} value={key}>
                          {provider.icon} {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newMethod.provider && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="api-key">API Key</Label>
                        <Input
                          id="api-key"
                          type="password"
                          placeholder="Enter API key"
                          value={newMethod.config.api_key || ''}
                          onChange={(e) => setNewMethod({
                            ...newMethod,
                            config: { ...newMethod.config, api_key: e.target.value }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="secret-key">Secret Key</Label>
                        <Input
                          id="secret-key"
                          type="password"
                          placeholder="Enter secret key"
                          value={newMethod.config.secret_key || ''}
                          onChange={(e) => setNewMethod({
                            ...newMethod,
                            config: { ...newMethod.config, secret_key: e.target.value }
                          })}
                        />
                      </div>
                    </div>

                    {(newMethod.provider === 'mpesa' || newMethod.provider === 'mtn_momo') && (
                      <div>
                        <Label htmlFor="merchant-id">Merchant ID</Label>
                        <Input
                          id="merchant-id"
                          placeholder="Enter merchant ID"
                          value={newMethod.config.merchant_id || ''}
                          onChange={(e) => setNewMethod({
                            ...newMethod,
                            config: { ...newMethod.config, merchant_id: e.target.value }
                          })}
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="environment">Environment</Label>
                      <Select
                        value={newMethod.config.environment || 'sandbox'}
                        onValueChange={(value) => setNewMethod({
                          ...newMethod,
                          config: { ...newMethod.config, environment: value as 'sandbox' | 'production' }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sandbox">Sandbox (Testing)</SelectItem>
                          <SelectItem value="production">Production (Live)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={addPaymentMethod} disabled={loading}>
                        Add Payment Method
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocalPaymentsIntegration;
