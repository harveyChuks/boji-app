import { ArrowRight, Calendar, Users, BarChart3, Clock, CheckCircle, Star, TrendingUp, DollarSign, QrCode, Scissors, TrendingDown, Sun, Moon, Edit, Share2, Zap, BarChart, Sparkles, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePageVisitTracker } from "@/hooks/usePageVisitTracker";
import { useTimeBasedTheme } from "@/hooks/useTimeBasedTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "@/contexts/LocationContext";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import dashboardMockup from "@/assets/mockup-dashboard.png";
import analyticsMockup from "@/assets/mockup-analytics.png";
import profileMockup from "@/assets/mockup-profile.png";
import bookingsMockup from "@/assets/mockup-bookings.png";
import servicesMockup from "@/assets/mockup-services.png";
import chartsMockup from "@/assets/mockup-charts.png";
import reportsMockup from "@/assets/mockup-reports.png";
import performanceMockup from "@/assets/mockup-performance.png";
import bojiLogo from "@/assets/boji-logo.png";

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  usePageVisitTracker(); // Track visits to landing page
  
  const { theme } = useTheme();
  const themeInfo = useTimeBasedTheme(true); // Enable time-based theming for landing page
  const { location, setLocation, currencySymbol, monthlyPrice } = useLocation();
  
  const [animatedText, setAnimatedText] = useState("Earn More");
  
  useEffect(() => {
    const benefits = ["Maximize Revenue", "Streamline Operations", "Scale Efficiently", "Delight Customers", "Enhance Your Brand"];
    let index = 0;
    
    const interval = setInterval(() => {
      index = (index + 1) % benefits.length;
      setAnimatedText(benefits[index]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Effortlessly manage appointments with intelligent time slot optimization and automated reminders."
    },
    {
      icon: Users,
      title: "Client Management",
      description: "Keep detailed client profiles, track preferences, and build lasting relationships with your customers."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Get insights into your business performance with comprehensive analytics and detailed reporting."
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Monitor service times, optimize workflows, and maximize your business efficiency."
    }
  ];

  const benefits = [
    "Reduce no-shows by up to 75% with automated reminders",
    "Save 3+ hours daily on administrative tasks",
    "Increase customer satisfaction with seamless booking",
    "Boost revenue with detailed performance insights",
    "Professional online presence with custom booking links",
    "Secure data management with enterprise-grade security"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      business: "Elegant Hair Studio",
      text: "Boji transformed how I run my salon. Booking management is now effortless!",
      rating: 5
    },
    {
      name: "Mike Chen",
      business: "Urban Barber Co.",
      text: "The analytics helped me identify peak hours and optimize my schedule perfectly.",
      rating: 5
    },
    {
      name: "Lisa Rodriguez",
      business: "Serenity Spa",
      text: "My clients love the easy booking system, and I love the automated reminders.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Free Trial Banner */}
      <section className="bg-gradient-to-r from-green-500 to-green-600 py-3 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
            <span className="text-white font-semibold text-sm sm:text-base">
              🎉 Limited Time Offer:
            </span>
            <span className="text-white text-sm sm:text-base">
              Get <span className="font-bold underline">3 Months FREE</span> when you start today
            </span>
            <Button 
              onClick={onGetStarted}
              size="sm"
              className="bg-white text-green-600 hover:bg-gray-100 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Claim Free Trial →
            </Button>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section id="about" className="relative py-12 sm:py-16 lg:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Trust Badge */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <p className="text-xs sm:text-sm font-semibold text-green-500 tracking-wider uppercase">
              POWERING 500+ SUCCESSFUL BUSINESSES
            </p>
          </div>
          
          
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-6 sm:space-y-8 order-2 lg:order-1 animate-fade-in">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-foreground leading-tight hover:scale-105 transition-transform duration-300">
                  We will Transform your Business even Better
                </h1>
                <div className="mt-3 sm:mt-4 h-10 sm:h-12 md:h-14 lg:h-16 overflow-hidden">
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-green-500 animate-pulse">
                    {animatedText}
                  </h2>
                </div>
                <p className="text-base sm:text-lg lg:text-xl text-foreground mt-4 sm:mt-6 max-w-lg animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
                  Boji empowers service businesses to automate scheduling, enhance client relationships, 
                  and accelerate growth — all from one comprehensive platform.
                </p>
              </div>
              
              {/* Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground font-medium">Smart Scheduling</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground font-medium">Business Intelligence</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground font-medium">Professional Presence</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground font-medium">Time Optimization</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground font-medium">Growth Tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground font-medium">Brand Excellence</span>
                </div>
              </div>
              
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white text-black hover:bg-white/90 hover:scale-105 hover:shadow-2xl transition-all duration-300 w-full sm:w-auto animate-scale-in shadow-lg"
              >
                Start Your Success Journey
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Customer Avatars and Rating */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-2 border-background flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                    S
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 border-2 border-background flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                    M
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-pink-500 to-red-500 border-2 border-background flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                    L
                  </div>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 border-2 border-background flex items-center justify-center text-white text-xs sm:text-sm font-bold">
                    +
                  </div>
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex justify-center sm:justify-start">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-foreground">4.9/5 from 500+ business owners</p>
                </div>
              </div>
            </div>
            
            {/* Right Column - Phone Mockups */}
            <div className="relative flex justify-center lg:justify-end order-1 lg:order-2 mb-8 lg:mb-0 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
              <div className="relative max-w-sm sm:max-w-md lg:max-w-none">
                {/* Main Phone - Dashboard */}
                <div className="relative z-10 transform rotate-[-8deg] hover:rotate-[-5deg] hover:scale-110 transition-all duration-500">
                  <img 
                    src={dashboardMockup} 
                    alt="Boji Dashboard on iPhone showing appointments, stats, and quick actions"
                    className="w-40 sm:w-48 md:w-60 lg:w-72 h-auto rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[3rem] shadow-2xl hover:shadow-green-500/20"
                  />
                </div>
                
                {/* Secondary Phone - Analytics positioned behind */}
                <div className="absolute -right-3 sm:-right-4 md:-right-6 lg:-right-8 top-8 sm:top-10 md:top-12 lg:top-16 z-0 transform rotate-[12deg] hover:rotate-[8deg] hover:scale-105 transition-all duration-500">
                  <img 
                    src={analyticsMockup} 
                    alt="Boji Analytics showing business reports and revenue"
                    className="w-32 sm:w-36 md:w-44 lg:w-56 h-auto rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl opacity-80 hover:opacity-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Stats Section */}
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-r from-green-500/10 via-accent/5 to-green-500/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-4 animate-scale-in">
            <div className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 animate-pulse font-bold text-2xl sm:text-3xl">
              {currencySymbol}
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground hover:scale-110 transition-transform duration-300">
              {location === 'UK' ? '125,000' : '15,750,000'}
            </div>
          </div>
          <p className="text-sm sm:text-base lg:text-lg text-foreground font-medium tracking-wider uppercase animate-fade-in">
            REVENUE GENERATED BY OUR PLATFORM USERS
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4 bg-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              The Complete Business Solution You Need to <span className="block sm:inline text-green-500">{animatedText}</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-foreground max-w-2xl mx-auto">
              Comprehensive tools designed specifically for service-based businesses to excel in today's competitive marketplace.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-card border-border hover:shadow-2xl hover:shadow-green-500/20 hover:-translate-y-2 transition-all duration-300 animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
              >
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500/20 to-card-foreground/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                    <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 group-hover:scale-110 transition-transform" style={{ color: 'hsl(var(--vivid-green))' }} />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-card-foreground mb-3 group-hover:text-green-500 transition-colors">{feature.title}</h3>
                  <p className="text-sm sm:text-base text-card-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard & Analytics Feature Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  Complete Business Overview at Your Fingertips
                </h3>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-foreground leading-relaxed">
                Get real-time insights into your business performance with comprehensive analytics, 
                revenue tracking, and intelligent business reports that help you make data-driven decisions.
              </p>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Real-time revenue and booking analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Service performance breakdown</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Completion rate tracking</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 lg:gap-6 justify-center order-1 lg:order-2 mb-6 lg:mb-0">
              <img 
                src={reportsMockup} 
                alt="Business reports showing revenue analytics"
                className="w-32 sm:w-36 md:w-48 lg:w-64 h-auto rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl transform rotate-[-6deg] hover:rotate-[-3deg] hover:scale-105 hover:shadow-2xl transition-all duration-500"
              />
              <img 
                src={performanceMockup} 
                alt="Service performance analytics with charts"
                className="w-32 sm:w-36 md:w-48 lg:w-64 h-auto rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl transform rotate-[8deg] hover:rotate-[5deg] hover:scale-105 hover:shadow-2xl transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Business Profile & Services Section */}
      <section className="py-16 sm:py-20 px-4 bg-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="flex gap-2 sm:gap-3 lg:gap-6 justify-center lg:order-1 mb-6 lg:mb-0">
              <img 
                src={profileMockup} 
                alt="Business profile with QR code for easy booking"
                className="w-32 sm:w-36 md:w-48 lg:w-64 h-auto rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl transform rotate-[5deg] hover:rotate-[2deg] hover:scale-105 hover:shadow-2xl transition-all duration-500"
              />
              <img 
                src={servicesMockup} 
                alt="Services management with pricing and duration"
                className="w-32 sm:w-36 md:w-48 lg:w-64 h-auto rounded-[1.25rem] sm:rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl transform rotate-[-10deg] hover:rotate-[-7deg] hover:scale-105 hover:shadow-2xl transition-all duration-500"
              />
            </div>
            <div className="space-y-4 sm:space-y-6 lg:order-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  Professional Online Presence & Service Management
                </h3>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-foreground leading-relaxed">
                Create a professional booking experience for your clients with custom QR codes and links, 
                while efficiently managing your services, pricing, and business profile.
              </p>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Custom QR codes for instant booking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Service pricing and duration management</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Professional business profile setup</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Management Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                  Effortless Appointment Management
                </h3>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-foreground leading-relaxed">
                Streamline your booking process with advanced filtering, search capabilities, 
                and comprehensive appointment tracking. Manage all your client interactions in one place.
              </p>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Advanced appointment filtering and search</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Real-time booking status updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-foreground">Client contact information management</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center order-1 lg:order-2 mb-6 lg:mb-0">
              <img 
                src={bookingsMockup} 
                alt="Bookings management showing appointment list and filtering"
                className="w-40 sm:w-48 md:w-60 lg:w-72 h-auto rounded-[1.5rem] sm:rounded-[2rem] lg:rounded-[2.5rem] shadow-xl transform rotate-[-4deg] hover:rotate-[-1deg] hover:scale-110 hover:shadow-2xl transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Boji Stands Apart
            </h2>
            <p className="text-xl text-foreground">
              Experience the advantages that drive business transformation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-foreground text-lg">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-accent/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Success Stories from Business Leaders
            </h2>
            <p className="text-xl text-foreground">
              Discover how Boji transforms business operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="bg-card border-border hover:shadow-2xl hover:-translate-y-2 hover:border-green-500/50 transition-all duration-300 animate-fade-in group"
                style={{ animationDelay: `${index * 0.15}s`, animationFillMode: 'both' }}
              >
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400 group-hover:scale-125 transition-transform" style={{ transitionDelay: `${i * 0.05}s` }} />
                    ))}
                  </div>
                  <p className="text-card-foreground mb-4 italic group-hover:text-green-500 transition-colors">"{testimonial.text}"</p>
                  <div>
                    <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                    <p className="text-sm text-card-foreground/80">{testimonial.business}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Manage Your Business Section */}
      <section className="py-16 sm:py-20 px-4 bg-accent/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                Manage your <span className="text-green-500">business</span>
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <QrCode className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">One Booking Link for All Services</h3>
                    <p className="text-muted-foreground">Share a single link that showcases all your services and staff</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <BarChart className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Analytics to Understand Your Business</h3>
                    <p className="text-muted-foreground">Track revenue, appointments, and performance metrics</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Marketing Tools to Grow</h3>
                    <p className="text-muted-foreground">Promote your services with built-in marketing features</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Multi-Staff Support</h3>
                    <p className="text-muted-foreground">Add team members and manage schedules effortlessly</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <img 
                src={dashboardMockup} 
                alt="Business dashboard"
                className="w-48 md:w-64 h-auto rounded-[2rem] shadow-xl transform rotate-[-6deg] hover:rotate-[-3deg] hover:scale-105 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Get Booked in 3 Easy Steps Section */}
      <section className="py-16 sm:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Get Booked in <span className="text-green-500">3 Easy Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <Edit className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3">Complete your Profile</h3>
                <p className="text-card-foreground">
                  Fill out your business details and unlock your personalized booking link that anyone can use to book you in seconds.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <Share2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3">Share your Link</h3>
                <p className="text-card-foreground">
                  Post your link on social media or send it directly to clients to make booking easy and start saving hours every week.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-card-foreground mb-3">Less Admin, More Clients</h3>
                <p className="text-card-foreground">
                  We handle the bookings, reminders, and more — so you can focus on actually serving clients and growing your business.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 px-4 bg-accent/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Affordable & <span className="text-green-500">Simple Pricing</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Designed for serious business owners ready to grow
            </p>
            <p className="text-sm text-muted-foreground">
              Showing pricing for: <span className="font-semibold text-green-500">{location === 'UK' ? '🇬🇧 United Kingdom' : '🇳🇬 Nigeria'}</span>
            </p>
          </div>

          <Card className="bg-card border-border hover:shadow-2xl transition-all duration-300 max-w-lg mx-auto">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Badge className="mb-4 bg-green-500 hover:bg-green-600">PRO</Badge>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold text-foreground">{currencySymbol}{monthlyPrice}</span>
                  <span className="text-xl text-muted-foreground">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground">3 months free trial | No card required</p>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="font-semibold text-foreground text-center mb-4">What's Included?</h3>
                
                <div>
                  <p className="text-xs font-semibold text-green-500 tracking-wider uppercase mb-2">RUN YOUR BUSINESS LIKE A PRO</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-card-foreground">Easy Online Bookings</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-card-foreground">Automated Reminders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-card-foreground">No-show Protection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-card-foreground">Multi-Staff Management</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-green-500 tracking-wider uppercase mb-2">GROW YOUR CLIENT BASE</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-card-foreground">Professional Booking Page</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-card-foreground">Work Portfolio Gallery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-card-foreground">QR Code for Easy Sharing</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-card-foreground">Client Communication Tools</span>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-green-500 tracking-wider uppercase mb-2">MAXIMIZE YOUR INCOME</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-card-foreground">Business Analytics & Insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-card-foreground">Revenue Tracking</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-card-foreground">Performance Reports</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-card-foreground">Booking Optimization</span>
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={onGetStarted}
                size="lg"
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 sm:py-20 px-4 bg-accent/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Everything you need to know about Boji
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="item-1" className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-card-foreground hover:text-green-500">
                How does the free trial work?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-muted-foreground">
                You get 3 months completely free when you sign up today. No credit card required. After the trial, 
                you can choose to continue with our affordable monthly plan at {currencySymbol}{monthlyPrice} or cancel anytime.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-card-foreground hover:text-green-500">
                What types of businesses can use Boji?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-muted-foreground">
                Boji is perfect for any service-based business including barbershops, hair salons, spas, beauty parlors,
                fitness studios, gyms, personal trainers, cleaning services, consulting services, and more. Any business that takes appointments can benefit from our platform.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-card-foreground hover:text-green-500">
                Can I customize my booking page?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-muted-foreground">
                Yes! You get a personalized booking link with your business name, custom services, your branding, 
                business hours, and more. Your clients will have a professional booking experience that reflects your brand.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-card-foreground hover:text-green-500">
                How do automated reminders work?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-muted-foreground">
                Boji automatically sends appointment reminders to your clients via email and SMS, significantly 
                reducing no-shows. You can customize when reminders are sent and what they say.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-card-foreground hover:text-green-500">
                Is my data secure?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-muted-foreground">
                Absolutely. We use enterprise-grade security with encrypted data storage and secure backups. 
                Your business and client information is protected with industry-standard security protocols.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-card-foreground hover:text-green-500">
                Can I manage multiple staff members?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-muted-foreground">
                Yes! Boji includes comprehensive staff management features. You can add team members, 
                assign services to specific staff, and track individual performance and bookings.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-card-foreground hover:text-green-500">
                What reports and analytics do I get?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-muted-foreground">
                You get comprehensive analytics including revenue tracking, booking trends, service performance, 
                client retention rates, peak business hours, and detailed financial reports to help you make informed decisions.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8" className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left text-base sm:text-lg font-semibold text-card-foreground hover:text-green-500">
                Can I cancel my subscription anytime?
              </AccordionTrigger>
              <AccordionContent className="text-sm sm:text-base text-muted-foreground">
                Yes, there are no long-term contracts. You can cancel your subscription at any time with no penalties or cancellation fees.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-accent/5 to-green-500/10"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Card className="bg-gradient-to-br from-card to-accent/20 border-border backdrop-blur-xs shadow-2xl">
            <CardContent className="p-8 sm:p-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-card-foreground mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-card-foreground mb-8 max-w-2xl mx-auto">
                Join hundreds of successful businesses using Boji to streamline operations and grow revenue
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={onGetStarted}
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white text-black hover:bg-white/90 hover:scale-105 hover:shadow-xl transition-all duration-300 shadow-lg"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">3 months free trial • No credit card required</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={bojiLogo} alt="Boji Logo" className="h-8 w-8" />
                <span className="text-xl font-bold text-foreground">Boji</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Empowering service businesses with intelligent scheduling and management solutions.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Product</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollToSection('features')} className="text-sm text-muted-foreground hover:text-green-500 transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('pricing')} className="text-sm text-muted-foreground hover:text-green-500 transition-colors">
                    Pricing
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('faq')} className="text-sm text-muted-foreground hover:text-green-500 transition-colors">
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/privacy" className="text-sm text-muted-foreground hover:text-green-500 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-sm text-muted-foreground hover:text-green-500 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/faqs" className="text-sm text-muted-foreground hover:text-green-500 transition-colors">
                    FAQs
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground">
                  support@boji.app
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-muted-foreground text-center sm:text-left">
                © {new Date().getFullYear()} Boji. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">
                Made with ❤️ for service businesses
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;