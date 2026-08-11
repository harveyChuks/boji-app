import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OwnerNotificationRequest {
  ownerEmail: string;
  businessName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  serviceName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  price: number;
  currency?: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      ownerEmail,
      businessName,
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      serviceName,
      appointmentDate,
      startTime,
      endTime,
      price,
      currency,
      notes,
    }: OwnerNotificationRequest = await req.json();

    console.log("Sending owner notification to:", ownerEmail);

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
          <title>New Booking</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">New Booking! 🎉</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
            
            <p style="font-size: 16px; margin-bottom: 30px;">You have a new booking for <strong>${businessName}</strong>!</p>
            
            <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="margin-top: 0; color: #f5576c; font-size: 18px;">Booking Details</h2>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><strong>Customer:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${customerName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><strong>Phone:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${customerPhone}</td>
                </tr>
                ${customerEmail ? `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><strong>Email:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${customerEmail}</td>
                </tr>
                ` : ''}
                ${customerAddress ? `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0;"><strong>Address:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">${customerAddress}</td>
                </tr>
                ` : ''}
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
                  <td style="padding: 10px 0; text-align: right; color: #f5576c; font-size: 18px; font-weight: bold;">${formatPrice(price)}</td>
                </tr>
              </table>
              
              ${notes ? `<p style="margin-top: 15px; margin-bottom: 0; background: white; padding: 10px; border-radius: 5px;"><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>
            
            <p style="font-size: 14px; color: #666; border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; text-align: center;">
              Log in to your dashboard to manage this booking
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Boji <noreply@bojiapp.me>",
      to: [ownerEmail],
      subject: `New Booking - ${customerName} for ${serviceName}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending owner notification:", error);
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
