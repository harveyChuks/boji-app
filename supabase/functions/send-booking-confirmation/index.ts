import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  appointmentId: string;
  customerEmail: string;
  customerName: string;
  businessName: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  price: number;
  currency?: string;
  businessPhone?: string;
  customerAddress?: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      appointmentId,
      customerEmail,
      customerName,
      businessName,
      serviceName,
      appointmentDate,
      startTime,
      endTime,
      price,
      currency,
      businessPhone,
      customerAddress,
      notes,
    }: BookingConfirmationRequest = await req.json();

    console.log("Sending booking confirmation to:", customerEmail);

    const baseUrl = Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app") || "https://lovable.app";
    const cancelUrl = `${baseUrl}/cancel-booking/${appointmentId}`;
    const rescheduleUrl = `${baseUrl}/reschedule-booking/${appointmentId}`;

    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const currencySymbols: Record<string, string> = {
      NGN: "₦", GHS: "₵", KES: "KSh", ZAR: "R", USD: "$", GBP: "£", CAD: "C$",
    };
    const formatPrice = (value: number) =>
      `${currencySymbols[currency ?? ""] ?? `${currency ?? ""} `}${Number(value ?? 0).toFixed(2)}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Confirmation</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Booking Confirmed! 🎉</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${customerName},</p>
            
            <p style="font-size: 16px; margin-bottom: 30px;">Your appointment has been confirmed! We're looking forward to seeing you.</p>
            
            <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="margin-top: 0; color: #667eea; font-size: 18px;">Appointment Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><strong>Business:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${businessName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><strong>Service:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${serviceName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><strong>Date:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${formatDate(appointmentDate)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><strong>Time:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${formatTime(startTime)} - ${formatTime(endTime)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0;"><strong>Price:</strong></td>
                  <td style="padding: 10px 0; text-align: right; color: #667eea; font-size: 18px; font-weight: bold;">${formatPrice(price)}</td>
                </tr>
              </table>
              
              ${businessPhone ? `<p style="margin-top: 15px; margin-bottom: 0;"><strong>Contact:</strong> ${businessPhone}</p>` : ''}
              ${customerAddress ? `<p style="margin-top: 10px; margin-bottom: 0;"><strong>Your address:</strong> ${customerAddress}</p>` : ''}
              ${notes ? `<p style="margin-top: 10px; margin-bottom: 0;"><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>
            
            <div style="text-align: center; margin-bottom: 30px;">
              <a href="${rescheduleUrl}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 5px; font-weight: 600;">Reschedule</a>
              <a href="${cancelUrl}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 5px; font-weight: 600;">Cancel Booking</a>
            </div>
            
            <p style="font-size: 14px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
              If you have any questions, please contact ${businessName}${businessPhone ? ` at ${businessPhone}` : ''}.
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Boji <noreply@bojiapp.me>",
      to: [customerEmail],
      subject: `Booking Confirmed - ${businessName}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending booking confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
