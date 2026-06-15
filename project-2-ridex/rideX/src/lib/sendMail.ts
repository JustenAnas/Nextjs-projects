import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

export async function verifyMailer() {
  try {
    await transporter.verify();
  } catch (e) {
    console.error("Mailer config error:", e);
  }
}

// 📨 Send OTP email
export async function sendOTPEmail(toEmail: string, otp: string) {
  const html = `
  <div style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:420px;background:#ffffff;border-radius:16px;padding:32px;box-shadow:0 10px 40px rgba(0,0,0,0.08);">
            
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:1px;color:#111;">RideX</h1>
                <p style="margin:4px 0 0;font-size:12px;color:#888;">Premium Vehicle Booking</p>
              </td>
            </tr>

            <tr>
              <td align="center">
                <h2 style="margin:0 0 10px;font-size:20px;color:#111;">Your Verification Code</h2>
                <p style="margin:0 0 20px;font-size:14px;color:#555;">
                  Use the code below to continue. This code expires in 5 minutes.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:20px 0;">
                <div style="
                  display:inline-block;
                  padding:14px 28px;
                  font-size:26px;
                  font-weight:700;
                  letter-spacing:6px;
                  color:#111;
                  background:#f4f4f5;
                  border-radius:10px;
                ">
                  ${otp}
                </div>
              </td>
            </tr>

            <tr>
              <td align="center">
                <p style="margin:0 0 10px;font-size:13px;color:#777;">
                  If you didn’t request this, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-top:20px;">
                <p style="margin:0;font-size:11px;color:#aaa;">
                  © ${new Date().getFullYear()} RideX. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </div>
  `;

  await transporter.sendMail({
    from: `"RideX" <${process.env.EMAIL}>`,
    to: toEmail,
    subject: "Your RideX OTP (valid for 5 minutes)",
    html,
  });
}

export async function sendCustomEmail(
  toEmail: string,
  subject: string,
  html: string
) {
  await transporter.sendMail({
    from: `"RideX" <${process.env.EMAIL}>`,
    to: toEmail,
    subject,
    html,
  });
}
