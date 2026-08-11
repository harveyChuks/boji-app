
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: () => void;
}

const AuthModal = ({ open, onOpenChange, onAuthSuccess }: AuthModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordRules = [
    { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
    { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
    { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
    { label: "One number", test: (v: string) => /[0-9]/.test(v) },
  ];

  const getAuthErrorMessage = (error: unknown) => {
    if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
      return "We couldn't reach the account service. Check your connection, disable any VPN or blocker, then try again.";
    }

    return error instanceof Error ? error.message : "Something went wrong. Please try again.";
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();


    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully.",
      });
      
      onOpenChange(false);
      onAuthSuccess?.();
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const failedRule = passwordRules.find((rule) => !rule.test(formData.password));
    if (failedRule) {
      toast({
        title: "Weak password",
        description: "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }


    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      
      onOpenChange(false);
    } catch (error: unknown) {
      toast({
        title: "Account creation failed",
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}`,
      });

      if (error) throw error;

      toast({
        title: "Check your email!",
        description: "We've sent you a password reset link. Please check your inbox and spam folder.",
      });
      
      setShowResetPassword(false);
      setFormData({ email: "", password: "", confirmPassword: "" });
    } catch (error: unknown) {
      toast({
        title: "Error sending reset email",
        description: getAuthErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (showResetPassword) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-card border-border text-foreground [.light_&]:!bg-white max-h-[85vh] p-4 sm:p-6 top-[8%] sm:top-[50%] translate-y-0 sm:translate-y-[-50%]">
          <ScrollArea className="max-h-[75vh] pr-4">
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-input border-border text-foreground"
                  placeholder="your@email.com"
                  required
                />
              </div>

              
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#39FF14] text-black hover:bg-[#39FF14]/90 [.light_&]:bg-black [.light_&]:text-white [.light_&]:hover:bg-black/90"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowResetPassword(false);
                  }}
                  className="border-border text-foreground hover:bg-muted"
                >
                  Back
                </Button>
              </div>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground [.light_&]:!bg-white max-h-[85vh] p-4 sm:p-6 top-[8%] sm:top-[50%] translate-y-0 sm:translate-y-[-50%]">
        <ScrollArea className="max-h-[75vh] pr-4">
          <DialogHeader>
            <DialogTitle>Welcome to Boji</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Sign in to manage your business or create a new account
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="login" className="w-full mt-4">
            <TabsList className="grid w-full grid-cols-2 bg-muted">
              <TabsTrigger value="login" className="data-[state=active]:bg-[#39FF14] data-[state=active]:text-black [.light_&]:data-[state=active]:bg-black [.light_&]:data-[state=active]:text-white">
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-[#39FF14] data-[state=active]:text-black [.light_&]:data-[state=active]:bg-black [.light_&]:data-[state=active]:text-white">
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-input border-border text-foreground"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="bg-input border-border text-foreground pr-10"
                      placeholder="Enter your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#39FF14] text-black hover:bg-[#39FF14]/90 [.light_&]:bg-black [.light_&]:text-white [.light_&]:hover:bg-black/90"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowResetPassword(true)}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  Forgot your password?
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-input border-border text-foreground"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="bg-input border-border text-foreground pr-10"
                      placeholder="Create a password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <ul className="space-y-1 text-xs">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(formData.password);
                    return (
                      <li
                        key={rule.label}
                        className={passed ? "text-primary" : "text-muted-foreground"}
                      >
                        {passed ? "\u2713" : "\u2022"} {rule.label}
                      </li>
                    );
                  })}
                </ul>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="bg-input border-border text-foreground pr-10"
                      placeholder="Confirm your password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#39FF14] text-black hover:bg-[#39FF14]/90 [.light_&]:bg-black [.light_&]:text-white [.light_&]:hover:bg-black/90"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
