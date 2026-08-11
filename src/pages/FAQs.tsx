import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "@/lib/router-compat";

const FAQs = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-primary hover:underline mb-4 inline-block">&larr; Back to Home</Link>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-foreground">Frequently Asked Questions</CardTitle>
            <p className="text-muted-foreground">Find answers to common questions about Boji</p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-foreground">What is Boji?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Boji is an online booking platform that connects customers with local service providers. Whether you need a haircut, beauty treatment, or other services, Boji makes it easy to discover businesses, book appointments, and manage your schedule.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-foreground">How do I book an appointment?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  To book an appointment, visit the business's booking page, select your desired service(s), choose a date and time, and provide your contact information. You'll receive a confirmation once your booking is complete.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-foreground">Do I need an account to book?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  No, you don't need an account to book - you can book as a guest with just your name and phone number. However, creating a free customer account gives you access to booking history, automatic discounts, and other benefits.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-foreground">Can I cancel or reschedule my appointment?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, you can cancel or reschedule appointments. However, cancellation and rescheduling policies vary by business. Please contact the business directly or check their specific policies on their booking page.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-foreground">How do payments work?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Payment methods depend on the individual business. Some may require a deposit at booking, while others accept payment at the time of service. Payment details will be shown during the booking process.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-foreground">How do I leave a review?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  After your appointment, you'll be prompted to leave a review. You can rate your experience and provide feedback about the service you received. Reviews help other customers and businesses improve.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-foreground">Is my personal information secure?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes, we take your privacy seriously. We use industry-standard security measures to protect your personal information. For more details, please read our Privacy Policy.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-foreground">How do I register my business on Boji?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  To register your business, click on "Register Business" on the homepage, fill out the registration form with your business details, and submit. New businesses get a 90-day free trial to explore all features.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger className="text-foreground">What are the subscription fees for businesses?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  All new businesses get a 90-day free trial. After the trial, subscription plans vary based on features and usage. Check our pricing page or contact us for detailed pricing information.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger className="text-foreground">How can businesses manage their bookings?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Business owners have access to a comprehensive dashboard where they can view, confirm, reschedule, or cancel appointments, manage services and staff, set business hours, and track analytics.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-11">
                <AccordionTrigger className="text-foreground">Can I book multiple services at once?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! You can select multiple services from the same business when making a booking. The system will automatically calculate the total duration and adjust available time slots accordingly.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-12">
                <AccordionTrigger className="text-foreground">What happens if the business cancels my appointment?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  If a business needs to cancel your appointment, they will contact you directly to reschedule or provide a refund if applicable. We encourage all businesses on our platform to maintain professional standards.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-13">
                <AccordionTrigger className="text-foreground">How do I contact customer support?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  You can reach us via WhatsApp at +234 XXX XXX XXXX or send us a direct message on Instagram @yourbojiapp. We're here to help with any questions or issues you may have.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-14">
                <AccordionTrigger className="text-foreground">What types of businesses can join Boji?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Boji welcomes various service-based businesses including barber shops, beauty salons, spas, nail salons, massage therapists, and other appointment-based service providers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-15">
                <AccordionTrigger className="text-foreground">Can I view my booking history?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Yes! Create a free customer account to access your personalized dashboard where you can view all your past and upcoming bookings, including appointment details, locations, and any discounts applied.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-16">
                <AccordionTrigger className="text-foreground">What is the loyalty program?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  When you create a customer account, you automatically become a loyalty member and receive a 3% discount on all bookings. Follow your favorite businesses on social media (Instagram or TikTok) to unlock an additional 2% discount, for a total of 5% off!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-17">
                <AccordionTrigger className="text-foreground">How do I claim my loyalty discount?</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  Simply create a free customer account and log in when booking. The 3% loyalty discount is automatically applied. To get the additional 2% social media discount, make sure to follow the business on Instagram or TikTok before booking - the system will recognize this and apply the extra discount.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQs;
