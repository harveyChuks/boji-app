import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/lib/router-compat";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="text-primary hover:underline mb-4 inline-block">&larr; Back to Home</Link>
        
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-foreground">Terms of Service</CardTitle>
            <p className="text-muted-foreground">Last updated: October 12, 2025</p>
          </CardHeader>
          <CardContent className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using Boji ("Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Boji is an online booking platform that connects customers with service providers (businesses). We facilitate appointment scheduling, payment processing, and communication between parties. We are not the provider of the services booked through our Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">3. User Accounts</h2>
              <p className="text-muted-foreground mb-2"><strong>Customers:</strong></p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>You may book appointments without creating an account</li>
                <li>You are responsible for providing accurate contact information</li>
                <li>You agree to attend scheduled appointments or cancel in accordance with the business's policy</li>
              </ul>
              <p className="text-muted-foreground mt-3 mb-2"><strong>Business Owners:</strong></p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>You must create an account to list your services</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must provide accurate business information and keep it updated</li>
                <li>You must comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">4. Bookings and Appointments</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>All bookings are subject to availability and confirmation by the service provider</li>
                <li>Customers must arrive on time for scheduled appointments</li>
                <li>Businesses reserve the right to refuse service for any legitimate reason</li>
                <li>Cancellation and rescheduling policies are set by individual businesses</li>
                <li>Boji is not responsible for disputes between customers and service providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">5. Payments and Fees</h2>
              <p className="text-muted-foreground mb-2"><strong>For Customers:</strong></p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Prices are set by individual businesses</li>
                <li>Deposits may be required for certain bookings</li>
                <li>Payment is typically made directly to the service provider</li>
              </ul>
              <p className="text-muted-foreground mt-3 mb-2"><strong>For Business Owners:</strong></p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Subscription fees apply based on your chosen plan</li>
                <li>A 90-day free trial is provided to new businesses</li>
                <li>Transaction fees may apply to processed payments</li>
                <li>Fees are non-refundable unless otherwise stated</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">6. User Conduct</h2>
              <p className="text-muted-foreground mb-2">You agree not to:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Provide false or misleading information</li>
                <li>Impersonate another person or entity</li>
                <li>Engage in fraudulent or illegal activities</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Interfere with the Platform's operation</li>
                <li>Use automated systems to access the Platform without authorization</li>
                <li>Post offensive, defamatory, or inappropriate content</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">7. Content and Reviews</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                <li>Users may post reviews and ratings based on their experiences</li>
                <li>Reviews must be honest, accurate, and based on actual experiences</li>
                <li>We reserve the right to remove inappropriate or fraudulent reviews</li>
                <li>Business owners may respond to reviews professionally</li>
                <li>By posting content, you grant us a license to use, display, and distribute it</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">8. Intellectual Property</h2>
              <p className="text-muted-foreground">
                The Platform and its content, features, and functionality are owned by Boji and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">9. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground">
                THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE. WE ARE NOT RESPONSIBLE FOR THE QUALITY, SAFETY, OR LEGALITY OF SERVICES PROVIDED BY BUSINESSES ON OUR PLATFORM.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">10. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, BOJI SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID TO US IN THE PAST 12 MONTHS.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">11. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify and hold harmless Boji and its affiliates from any claims, damages, losses, liabilities, and expenses arising from your use of the Platform, violation of these Terms, or infringement of any third-party rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">12. Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to suspend or terminate your account at any time for violations of these Terms or for any other reason. You may also delete your account at any time. Upon termination, your right to use the Platform ceases immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">13. Dispute Resolution</h2>
              <p className="text-muted-foreground">
                Any disputes arising from these Terms shall be resolved through good faith negotiations. If negotiations fail, disputes will be submitted to binding arbitration in accordance with the laws of Nigeria.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">14. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms are governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">15. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may modify these Terms at any time. Material changes will be notified via email or Platform notification. Your continued use of the Platform after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">16. Severability</h2>
              <p className="text-muted-foreground">
                If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">17. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us:
              </p>
              <ul className="list-none text-muted-foreground space-y-1 ml-4">
                <li><strong>WhatsApp:</strong> +234 XXX XXX XXXX</li>
                <li><strong>Instagram:</strong> @yourbojiapp</li>
              </ul>
            </section>

            <section className="pt-4 border-t border-border">
              <p className="text-muted-foreground text-sm italic">
                By using Boji, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
