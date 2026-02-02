import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Loader2, Gift } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

interface CustomerAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess?: () => void;
}

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  
  // NOTE: Lovable doesn't support using VITE_* env vars in runtime code.
  const HCAPTCHA_SITE_KEY = "735c34e4-d862-4c18-8f7e-28f46a2aaea0";
  
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
    if (!captchaToken) {
      toast({
        title: "Captcha Required",
        description: "Please complete the captcha verification",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const validated = loginSchema.parse(loginData);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
        options: {
          captchaToken,
        },
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've been successfully logged in.",
        });
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
        onOpenChange(false);
        onAuthSuccess?.();
      }
    } catch (error: any) {
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Failed",
          description: error.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!captchaToken) {
      toast({
        title: "Captcha Required",
        description: "Please complete the captcha verification",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const validated = signupSchema.parse(signupData);

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          emailRedirectTo: redirectUrl,
          captchaToken,
          data: {
            name: validated.name,
            phone: validated.phone,
            account_type: 'customer',
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        setCaptchaToken(null);
        captchaRef.current?.resetCaptcha();
        
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
    } catch (error: any) {
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signup Failed",
          description: error.message || "Could not create account. Please try again.",
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

    if (!captchaToken) {
      toast({
        title: "Captcha Required",
        description: "Please complete the captcha verification",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
        captchaToken,
      });

      if (error) throw error;

      toast({
        title: "Check Your Email",
        description: "We've sent you a password reset link. Please check your email.",
      });

      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
    } catch (error: any) {
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
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

              <div className="flex justify-center">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={HCAPTCHA_SITE_KEY}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                />
              </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                    setCaptchaToken(null);
                    captchaRef.current?.resetCaptcha();
                }}
                variant="outline"
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleForgotPassword}
                  disabled={loading || !captchaToken}
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
                      setCaptchaToken(null);
                      captchaRef.current?.resetCaptcha();
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
                  onKeyPress={(e) => e.key === 'Enter' && captchaToken && handleLogin()}
                />
              </div>

              <div className="flex justify-center">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={HCAPTCHA_SITE_KEY}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                />
              </div>

              <Button
                onClick={handleLogin}
                disabled={loading || !captchaToken}
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
                <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
              </div>

              <div className="flex justify-center">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={HCAPTCHA_SITE_KEY}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => setCaptchaToken(null)}
                />
              </div>

              <Button
                onClick={handleSignup}
                disabled={loading || !captchaToken}
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
