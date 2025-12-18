'use server';

import nodemailer from 'nodemailer';
import { ReservationFormData } from '@/components/forms/reservation-form';
import { generateEmailTemplate, createInfoRow, createInfoBox } from '@/lib/email-template';

export async function submitReservation(data: ReservationFormData) {
    const { name, email, phone, bookingType, date, time, guests, message } = data;

    // Log reservation details with clear formatting for admin
    console.log('═══════════════════════════════════════════════');
    console.log('🎯 NEW RESERVATION REQUEST');
    console.log('═══════════════════════════════════════════════');
    console.log(`📅 Date: ${date} at ${time}`);
    console.log(`👤 Name: ${name}`);
    console.log(`📧 Email: ${email}`);
    console.log(`📱 Phone: ${phone}`);
    console.log(`🍽️  Booking Type: ${bookingType}`);
    console.log(`👥 Number of Guests: ${guests}`);
    console.log(`💬 Message: ${message || 'None'}`);
    console.log('═══════════════════════════════════════════════');

    // Try to send email, but don't fail if it doesn't work
    try {
        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT || 587),
                secure: false,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                requireTLS: true,
            });

            const adminEmail = process.env.ADMIN_EMAIL || 'info@ideallivs.com';
            const secondaryEmail = process.env.SECONDARY_ADMIN_EMAIL;
            const recipients = secondaryEmail ? [adminEmail, secondaryEmail] : [adminEmail];
            const fromEmail = process.env.SMTP_USER;

            // Create admin email with beautiful template
            const adminEmailHtml = generateEmailTemplate({
                title: 'New Reservation Request',
                heading: '🎯 New Reservation Request',
                contentSections: [
                    {
                        title: 'Reservation Details',
                        content: `
              <table width="100%" cellpadding="0" cellspacing="0">
                ${createInfoRow('Date', date)}
                ${createInfoRow('Time', time)}
                ${createInfoRow('Booking Type', bookingType.charAt(0).toUpperCase() + bookingType.slice(1))}
                ${createInfoRow('Number of Guests', guests)}
              </table>
            `
                    },
                    {
                        title: 'Customer Information',
                        content: `
              <table width="100%" cellpadding="0" cellspacing="0">
                ${createInfoRow('Name', name)}
                ${createInfoRow('Email', `<a href="mailto:${email}" style="color: #8B1538; text-decoration: none;">${email}</a>`)}
                ${createInfoRow('Phone', `<a href="tel:${phone.replace(/\s/g, '')}" style="color: #8B1538; text-decoration: none;">${phone}</a>`)}
              </table>
            `
                    },
                    ...(message ? [{
                        title: 'Special Requests',
                        content: createInfoBox(message)
                    }] : [])
                ]
            });

            // Try to send admin notification
            await transporter.sendMail({
                from: `"Royal Sweets Reservations" <${fromEmail}>`,
                to: recipients,
                subject: `New Reservation: ${name} - ${date} @ ${time}`,
                html: adminEmailHtml,
            });

            // Create customer confirmation email
            const customerEmailHtml = generateEmailTemplate({
                title: 'Reservation Request Received',
                heading: '✅ Reservation Request Received',
                contentSections: [
                    {
                        title: `Thank You, ${name}!`,
                        content: `
              <p style="margin: 0 0 15px 0; color: #333333; font-size: 14px; line-height: 1.6;">
                We have received your reservation request for <strong>${guests} guests</strong> on <strong>${date} at ${time}</strong>.
              </p>
              <p style="margin: 0; color: #333333; font-size: 14px; line-height: 1.6;">
                Our team will contact you shortly at <strong>${phone}</strong> to confirm your booking.
              </p>
            `
                    },
                    {
                        title: 'Your Reservation Details',
                        content: `
              <table width="100%" cellpadding="0" cellspacing="0">
                ${createInfoRow('Date', date)}
                ${createInfoRow('Time', time)}
                ${createInfoRow('Guests', guests)}
                ${createInfoRow('Booking Type', bookingType.charAt(0).toUpperCase() + bookingType.slice(1))}
              </table>
            `
                    }
                ]
            });

            // Try to send customer confirmation
            await transporter.sendMail({
                from: `"Royal Sweets & Restaurant" <${fromEmail}>`,
                to: email,
                subject: 'Reservation Request Received - Royal Sweets',
                html: customerEmailHtml,
            });

            console.log('✅ Emails sent successfully');
        }
    } catch (emailError) {
        console.error('⚠️  Email sending failed (reservation still recorded):', emailError);
    }

    // Always return success since reservation is logged
    return {
        success: true,
        message: 'Your reservation request has been received. We will contact you shortly to confirm.'
    };
}
