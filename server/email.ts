import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface TradieApplicationData {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  postcode: string;
  tradeName: string;
  abn: string;
  categories: string[];
  yearsExperience: string;
  license: string;
  insurance: string;
  qualifications: string;
  hourlyRate: string;
  serviceAreas: string[];
  bio: string;
  whyChooseMe: string;
}

export async function sendTradieApplicationEmail(data: TradieApplicationData): Promise<void> {
  if (!resend) {
    console.log("No RESEND_API_KEY set — skipping email");
    return;
  }

  const approveUrl = `https://tradieconnect-production.up.railway.app/api/tradie/approve/${data.userId}?secret=${process.env.SESSION_SECRET}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px;">
      <div style="background:linear-gradient(135deg,#1e3a5f,#2d5a8e);padding:24px;border-radius:12px;margin-bottom:20px;">
        <h1 style="color:white;margin:0;font-size:22px;">🔧 New Tradie Application</h1>
        <p style="color:rgba(255,255,255,0.8);margin:6px 0 0 0;">Submitted via TradieConnect</p>
      </div>

      <div style="background:white;border-radius:12px;padding:24px;margin-bottom:16px;border:1px solid #e2e8f0;">
        <h2 style="color:#1e293b;font-size:16px;margin:0 0 16px 0;padding-bottom:8px;border-bottom:2px solid #f1b42f;">👤 Personal Information</h2>
        <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
        <p><strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a></p>
        <p><strong>Location:</strong> ${data.location} ${data.postcode}</p>
      </div>

      <div style="background:white;border-radius:12px;padding:24px;margin-bottom:16px;border:1px solid #e2e8f0;">
        <h2 style="color:#1e293b;font-size:16px;margin:0 0 16px 0;padding-bottom:8px;border-bottom:2px solid #f1b42f;">🏢 Business Details</h2>
        <p><strong>Business Name:</strong> ${data.tradeName}</p>
        <p><strong>ABN:</strong> ${data.abn || "Not provided"}</p>
        <p><strong>Experience:</strong> ${data.yearsExperience}</p>
        <p><strong>Hourly Rate:</strong> ${data.hourlyRate}</p>
        <p><strong>Categories:</strong> ${data.categories.join(", ") || "None"}</p>
        <p><strong>Service Areas:</strong> ${data.serviceAreas.join(", ") || "None"}</p>
      </div>

      <div style="background:white;border-radius:12px;padding:24px;margin-bottom:16px;border:1px solid #e2e8f0;">
        <h2 style="color:#1e293b;font-size:16px;margin:0 0 16px 0;padding-bottom:8px;border-bottom:2px solid #f1b42f;">🛡️ Qualifications</h2>
        <p><strong>License:</strong> ${data.license || "Not provided"}</p>
        <p><strong>Insurance:</strong> ${data.insurance || "Not provided"}</p>
        <p><strong>Qualifications:</strong> ${data.qualifications || "Not provided"}</p>
      </div>

      <div style="background:white;border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #e2e8f0;">
        <h2 style="color:#1e293b;font-size:16px;margin:0 0 16px 0;padding-bottom:8px;border-bottom:2px solid #f1b42f;">📝 Profile</h2>
        <p><strong>About:</strong> ${data.bio || "Not provided"}</p>
        <p><strong>Why Choose Me:</strong> ${data.whyChooseMe || "Not provided"}</p>
      </div>

      <div style="text-align:center;margin-bottom:20px;">
        <a href="${approveUrl}" style="display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:white;padding:16px 40px;border-radius:12px;text-decoration:none;font-size:18px;font-weight:bold;box-shadow:0 4px 12px rgba(22,163,74,0.3);">
          ✅ Approve This Tradie
        </a>
        <p style="color:#64748b;font-size:12px;margin-top:8px;">Clicking this will verify their account so they can access the tradie dashboard</p>
      </div>

      <p style="text-align:center;color:#64748b;font-size:12px;">
        Submitted ${new Date().toLocaleString("en-AU", { timeZone: "Australia/Brisbane" })} AEST
      </p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "TradieConnect <onboarding@resend.dev>",
      to: "tradieconnectadmin@gmail.com",
      subject: `New Tradie Application — ${data.firstName} ${data.lastName} (${data.tradeName})`,
      html,
    });
    console.log("Tradie application email sent successfully");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}
