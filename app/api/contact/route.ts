import { NextRequest, NextResponse } from 'next/server';
import { brandConfig } from '@/config/brand.config';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log contact form submission
    console.log('═══════════════════════════════════════════════');
    console.log('📧 NEW CONTACT FORM SUBMISSION');
    console.log('═══════════════════════════════════════════════');
    console.log(`👤 Name: ${name}`);
    console.log(`📧 Email: ${email}`);
    console.log(`📱 Phone: ${phone || 'Not provided'}`);
    console.log(`📝 Subject: ${subject}`);
    console.log(`💬 Message: ${message}`);
    console.log('═══════════════════════════════════════════════');

    // Try to send email using Titan Email SMTP
    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        const smtpPort = Number(process.env.SMTP_PORT || 587);
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: smtpPort,
          secure: smtpPort === 465, // true for 465 (SSL), false for other ports (STARTTLS)
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          ...(smtpPort !== 465 && { requireTLS: true }), // Only use requireTLS for non-SSL ports
        });

        const adminEmail = process.env.ADMIN_EMAIL || 'info@ideallivs.com';
        const secondaryEmail = process.env.SECONDARY_ADMIN_EMAIL;
        const recipients = secondaryEmail ? [adminEmail, secondaryEmail] : [adminEmail];
        const fromEmail = process.env.SMTP_USER;

        // Send email to admin
        await transporter.sendMail({
          from: `"IDeal Indiska livs Contact" <${fromEmail}>`,
          to: recipients,
          replyTo: email,
          subject: `Contact Form: ${subject}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>New Contact Form Submission</title>
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                  <tr>
                    <td style="background: linear-gradient(135deg, #8B1538 0%, #5A0F25 100%); padding: 40px 30px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Contact Form Submission</h1>
                      <p style="color: #f3d7a0; margin: 10px 0 0 0; font-size: 14px;">Anmol Sweets & Restaurant</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 40px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-bottom: 30px;">
                            <h2 style="color: #8B1538; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #f3d7a0; padding-bottom: 10px;">Contact Information</h2>

                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666666; width: 100px; font-weight: 600;">Name:</td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333333;">${name}</td>
                              </tr>
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666666; font-weight: 600;">Email:</td>
                                <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #8B1538; text-decoration: none;">${email}</a></td>
                              </tr>
                              ${phone ? `
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666666; font-weight: 600;">Phone:</td>
                                <td style="padding: 8px 0; font-size: 14px;"><a href="tel:${phone.replace(/\s/g, '')}" style="color: #8B1538; text-decoration: none;">${phone}</a></td>
                              </tr>
                              ` : ''}
                              <tr>
                                <td style="padding: 8px 0; font-size: 14px; color: #666666; font-weight: 600;">Subject:</td>
                                <td style="padding: 8px 0; font-size: 14px; color: #333333;">${subject.charAt(0).toUpperCase() + subject.slice(1)}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 30px;">
                            <h2 style="color: #8B1538; margin: 0 0 20px 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #f3d7a0; padding-bottom: 10px;">Message</h2>
                            <div style="background-color: #f9f9f9; border-left: 4px solid #f3d7a0; padding: 15px; margin-top: 15px;">
                              <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top: 20px; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0; color: #999999; font-size: 12px; text-align: center;">
                              This email was sent from the contact form at <a href="https://ideallivs.com" style="color: #8B1538; text-decoration: none;">ideallivs.com</a>
                            </p>
                            <p style="margin: 10px 0 0 0; color: #999999; font-size: 12px; text-align: center;">
                              Received on ${new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Stockholm'
          })} (Stockholm time)
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="background-color: #8B1538; padding: 20px 30px; text-align: center;">
                      <p style="margin: 0; color: #f3d7a0; font-size: 12px;">
                        © ${new Date().getFullYear()} Anmol Sweets & Restaurant. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
        });

        console.log('✅ Contact form email sent successfully');

        return NextResponse.json({
          success: true,
          message: 'Your message has been sent successfully. We will get back to you soon!',
        });
      }
    } catch (emailError) {
      console.error('⚠️  Email sending failed (contact form still recorded):', emailError);
    }

    // Always return success since form is logged
    return NextResponse.json({
      success: true,
      message: 'Your message has been received. We will contact you soon!',
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      {
        error: 'Failed to process contact form',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
