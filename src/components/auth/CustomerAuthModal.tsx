import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Loader2, Gift } from "lucide-react";

interface CustomerAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: () => void;
}

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(/[A-Z]/, "Password must include an uppercase letter")
    .regex(/[a-z]/, "Password must include a lowercase letter")
    .regex(/[0-9]/, "Password must include a number"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const CustomerAuthModal = ({ open, onOpenChange, onAuthSuccess }: CustomerAuthModalProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const passwordRules = [
    { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
    { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
    { label: "One lowercase letter", test: (v: string) => /[a-z]/.test(v) },
    { label: "One number", test: (v: string) => /[0-9]/.test(v) },
  ];

  const getAuthErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
      return "We couldn't reach the account service. Check your connection, disable any VPN or blocker, then try again.";
    }

    return error instanceof Error ? error.message : fallback;
  };
  
  // Login state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  
  // Signup state
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleLogin = async () => {

    setLoading(true);
    try {
      const validated = loginSchema.parse(loginData);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
        onOpenChange(false);
        onAuthSuccess?.();
      }
    } catch (error: unknown) {
      
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: getAuthErrorMessage(error, "Invalid email or password"),
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {

    setLoading(true);
    try {
      const validated = signupSchema.parse(signupData);

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: validated.name,
            phone: validated.phone,
            account_type: 'customer',
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        
        // Check if email confirmation is required
        if (data.session) {
          // User is immediately logged in (email confirmation disabled)
          toast({
            title: "Account Created! 🎉",
            description: "Welcome to Boji! You now get 3% off all bookings as a loyalty member.",
          });
          onOpenChange(false);
          onAuthSuccess?.();
        } else {
          // Email confirmation required
          toast({
            title: "Check Your Email",
            description: "We've sent you a confirmation email. Please verify your email to sign in.",
          });
          onOpenChange(false);
        }
      }
    } catch (error: unknown) {
      
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup Failed",
          description: getAuthErrorMessage(error, "Could not create account. Please try again."),
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }


    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Check Your Email",
        description: "We've sent you a password reset link. Please check your email.",
      });

      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getAuthErrorMessage(error, "Failed to send password reset email"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-card z-10 pb-4">
          <DialogTitle className="text-foreground">
            {showForgotPassword ? "Reset Password" : "Customer Account"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {showForgotPassword 
              ? "Enter your email to receive a password reset link"
              : "Sign in or create an account to access exclusive benefits"
            }
          </DialogDescription>
        </DialogHeader>

        {showForgotPassword ? (
          <div className="space-y-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-foreground">Email</Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="your.email@example.com"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                disabled={loading}
                className="bg-background border-border text-foreground"
              />
            </div>


            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                }}
                variant="outline"
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleForgotPassword}
                  disabled={loading}
                className="flex-1"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Reset Link
              </Button>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="login" className="w-full pb-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-foreground">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  disabled={loading}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password" className="text-foreground">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(true);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  disabled={loading}
                  className="bg-background border-border text-foreground"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>


              <Button
                onClick={handleLogin}
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Log In
              </Button>
            </TabsContent>

            {/* Signup Tab */}
            <TabsContent value="signup" className="space-y-4">
              {/* Benefits Banner */}
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Gift className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">Loyalty Rewards!</p>
                    <p className="text-muted-foreground">Get 3% off all bookings + follow businesses for extra discounts</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-foreground">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  disabled={loading}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-foreground">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  disabled={loading}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="signup-phone"
                  type="tel"
                  placeholder="+234 XXX XXX XXXX"
                  value={signupData.phone}
                  onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                  disabled={loading}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-foreground">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  disabled={loading}
                  className="bg-background border-border text-foreground"
                />
                <ul className="space-y-1 text-xs">
                  {passwordRules.map((rule) => {
                    const passed = rule.test(signupData.password);
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
              </div>


              <Button
                onClick={handleSignup}
                disabled={loading}
                className="w-full"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Account
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};
