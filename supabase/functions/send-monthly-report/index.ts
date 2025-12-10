import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MonthlyReportData {
  businessId: string;
  businessName: string;
  ownerEmail: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalRevenue: number;
  newCustomers: number;
  topServices: Array<{ name: string; count: number }>;
  currency: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all active businesses with owner emails
    const { data: businesses, error: businessError } = await supabase
      .from("businesses")
      .select("id, name, email, owner_id, currency")
      .eq("is_active", true);

    if (businessError) throw businessError;

    console.log(`Processing monthly reports for ${businesses?.length || 0} businesses`);

    const now = new Date();
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    for (const business of businesses || []) {
      try {
        // Get appointments for last month
        const { data: appointments, error: apptError } = await supabase
          .from("appointments")
          .select("id, status, final_price, service_id, customer_id, services(name)")
          .eq("business_id", business.id)
          .gte("appointment_date", firstDayLastMonth.toISOString().split("T")[0])
          .lte("appointment_date", lastDayLastMonth.toISOString().split("T")[0]);

        if (apptError) {
          console.error(`Error fetching appointments for business ${business.id}:`, apptError);
          continue;
        }

        // Calculate metrics
        const totalAppointments = appointments?.length || 0;
        const completedAppointments = appointments?.filter(a => a.status === "completed").length || 0;
        const cancelledAppointments = appointments?.filter(a => a.status === "cancelled").length || 0;
        const totalRevenue = appointments
          ?.filter(a => a.status === "completed")
          .reduce((sum, a) => sum + (parseFloat(a.final_price?.toString() || "0")), 0) || 0;

        // Get unique customers
        const uniqueCustomers = new Set(appointments?.map(a => a.customer_id).filter(Boolean));
        const newCustomers = uniqueCustomers.size;

        // Get top services
        const serviceCounts = new Map<string, number>();
        appointments?.forEach(a => {
          if (a.services?.name) {
            serviceCounts.set(a.services.name, (serviceCounts.get(a.services.name) || 0) + 1);
          }
        });
        const topServices = Array.from(serviceCounts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        const reportData: MonthlyReportData = {
          businessId: business.id,
          businessName: business.name,
          ownerEmail: business.email || "",
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          totalRevenue,
          newCustomers,
          topServices,
          currency: business.currency || "NGN",
        };

        // Only send if there's activity or if it's a valid email
        if (totalAppointments > 0 && reportData.ownerEmail) {
          await sendMonthlyReport(reportData, firstDayLastMonth, lastDayLastMonth);
          console.log(`Sent monthly report to ${reportData.ownerEmail} for ${reportData.businessName}`);
        }
      } catch (error) {
        console.error(`Error processing business ${business.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Monthly reports sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-monthly-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

async function sendMonthlyReport(
  data: MonthlyReportData,
  startDate: Date,
  endDate: Date
): Promise<void> {
  const monthYear = startDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const completionRate = data.totalAppointments > 0
    ? ((data.completedAppointments / data.totalAppointments) * 100).toFixed(1)
    : "0";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; }
        .metric-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 32px; font-weight: bold; color: #667eea; margin: 10px 0; }
        .metric-label { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
        .section { margin: 30px 0; }
        .section-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #333; border-bottom: 2px solid #667eea; padding-bottom: 8px; }
        .service-item { padding: 12px; background: #f8f9fa; margin: 8px 0; border-radius: 6px; display: flex; justify-content: space-between; }
        .service-name { font-weight: 500; }
        .service-count { color: #667eea; font-weight: 600; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 10px 10px; }
        .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Monthly Business Report</h1>
          <p>${monthYear} - ${data.businessName}</p>
        </div>
        
        <div class="content">
          <p>Hello,</p>
          <p>Here's your monthly performance summary for <strong>${monthYear}</strong>.</p>
          
          <div class="metric-grid">
            <div class="metric-card">
              <div class="metric-label">Total Appointments</div>
              <div class="metric-value">${data.totalAppointments}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Total Revenue</div>
              <div class="metric-value">${data.currency} ${data.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="metric-card">
              <div class="metric-label">Completed</div>
              <div class="metric-value">${data.completedAppointments}</div>
              <small style="color: #28a745;">${completionRate}% completion rate</small>
            </div>
            <div class="metric-card">
              <div class="metric-label">New Customers</div>
              <div class="metric-value">${data.newCustomers}</div>
            </div>
          </div>

          ${data.topServices.length > 0 ? `
          <div class="section">
            <div class="section-title">🏆 Top Services</div>
            ${data.topServices.map(service => `
              <div class="service-item">
                <span class="service-name">${service.name}</span>
                <span class="service-count">${service.count} bookings</span>
              </div>
            `).join('')}
          </div>
          ` : ''}

          <div class="section">
            <div class="section-title">📈 Key Insights</div>
            <ul style="line-height: 2;">
              <li><strong>${data.completedAppointments}</strong> appointments completed successfully</li>
              <li><strong>${data.cancelledAppointments}</strong> appointments cancelled</li>
              <li>Average revenue per completed appointment: <strong>${data.currency} ${data.completedAppointments > 0 ? (data.totalRevenue / data.completedAppointments).toFixed(2) : '0'}</strong></li>
              <li>You served <strong>${data.newCustomers}</strong> customers this month</li>
            </ul>
          </div>

          <center>
            <a href="https://xbfwwtfnnpksjyolgpxe.supabase.co" class="cta-button">View Full Dashboard</a>
          </center>
        </div>

        <div class="footer">
          <p>This is an automated monthly report from your BizFlow account.</p>
          <p>Keep up the great work! 🎉</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: "Boji <admin@bojiapp.me>",
    to: [data.ownerEmail],
    subject: `📊 Your Monthly Report - ${monthYear}`,
    html,
  });
}

serve(handler);
