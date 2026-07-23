const nodemailer = require('nodemailer');
const { Setting, User } = require('../models');
const { decrypt } = require('./crypto');

class NotificationService {
    async getSettings() {
        const SettingModel = Setting();
        
        // Fetch notifications settings
        const notifEntry = await SettingModel.findOne({ where: { group_key: 'notifications' } });
        let notifications = {};
        if (notifEntry && notifEntry.value) {
            notifications = typeof notifEntry.value === 'string' ? JSON.parse(notifEntry.value) : notifEntry.value;
        }

        // Fetch SMTP configuration
        let emailConfig = null; // Removed DB dependency for SmtpSetting

        return { notifications, emailConfig };
    }

    createTransporter(emailConfig) {
        if (!emailConfig || !emailConfig.host) return null;
        
        const decryptedPassword = decrypt(emailConfig.encrypted_password);
        
        return nodemailer.createTransport({
            host: emailConfig.host,
            port: emailConfig.port || 587,
            secure: emailConfig.encryption === 'SSL', // true for 465 SSL, false for TLS (usually 587)
            auth: {
                user: emailConfig.username,
                pass: decryptedPassword,
            },
        });
    }

    async getAdminEmails() {
        const UserModel = User();
        const admins = await UserModel.findAll({ where: { role: 'admin' } });
        return admins.map(admin => admin.email).filter(Boolean);
    }

    async dispatch(eventType, data) {
        try {
            const { notifications, emailConfig } = await this.getSettings();
            
            // Check if the event alert is enabled in system alerts
            let alertEnabled = false;
            let subject = '';
            let text = '';
            let adminOnly = false;
            let targetEmail = data.email || null;
            let targetPhone = data.phone || null;

            switch (eventType) {
                case 'NEW_LEAD':
                    alertEnabled = (notifications.new_lead_alerts === 'on' || notifications.new_lead_alerts === true);
                    subject = 'New Contact Lead Received';
                    text = `A new lead has been submitted.\nName: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'N/A'}\nMessage: ${data.message}`;
                    adminOnly = true;
                    break;
                case 'NEW_BOOKING':
                    alertEnabled = (notifications.new_booking_alerts === 'on' || notifications.new_booking_alerts === true);
                    subject = 'New Booking Alert';
                    text = `A new booking has been scheduled.\nName: ${data.clientName}\nEmail: ${data.clientEmail}\nService: ${data.serviceType}\nDate: ${data.date} at ${data.time}`;
                    adminOnly = true;
                    break;
                case 'CLIENT_CONFIRMATION':
                    // We assume client confirmations are sent if email notifications are enabled globally.
                    alertEnabled = true; 
                    subject = data.subject || 'Confirmation from Sarangi Consulting';
                    text = data.message || 'Thank you! We have received your request and will get back to you soon.';
                    adminOnly = false;
                    break;
                default:
                    console.log(`[Notification] Unknown event type: ${eventType}`);
                    return;
            }

            // Delivery Channels Evaluation
            const useEmail = (notifications.email_notifications === 'on' || notifications.email_notifications === true);
            const useSMS = (notifications.sms_notifications === 'on' || notifications.sms_notifications === true);
            const useWhatsApp = (notifications.whatsapp_notifications === 'on' || notifications.whatsapp_notifications === true);
            const usePush = (notifications.push_notifications === 'on' || notifications.push_notifications === true);

            // 1. Dispatch Email
            if (alertEnabled && useEmail) {
                const transporter = this.createTransporter(emailConfig);
                if (transporter) {
                    const fromEmail = emailConfig.sender_email || 'no-reply@sarangiconsulting.com';
                    const fromName = emailConfig.sender_name || 'Sarangi Admin';
                    
                    let recipients = [];
                    if (adminOnly) {
                        recipients = await this.getAdminEmails();
                    } else if (targetEmail) {
                        recipients = [targetEmail];
                    }

                    if (recipients.length > 0) {
                        const mailOptions = {
                            from: `"${fromName}" <${fromEmail}>`,
                            to: recipients.join(', '),
                            subject: subject,
                            text: text
                        };
                        
                        // Async send (don't await to avoid blocking)
                        transporter.sendMail(mailOptions).then(info => {
                            console.log(`[Notification] Email sent: ${info.messageId}`);
                        }).catch(err => {
                            console.error(`[Notification] Failed to send email:`, err);
                        });
                    }
                } else {
                    console.log(`[Notification] Email channel active but SMTP not configured. Simulating Email to: ${adminOnly ? 'Admins' : targetEmail}`);
                }
            }

            // 2. Dispatch SMS (Simulated)
            if (alertEnabled && useSMS) {
                if (targetPhone || adminOnly) {
                    console.log(`[Notification] 📲 SIMULATED SMS SENT TO: ${adminOnly ? 'Admins' : targetPhone}`);
                    console.log(`[Notification] 📲 SMS Body: ${subject}`);
                }
            }

            // 3. Dispatch WhatsApp (Simulated)
            if (alertEnabled && useWhatsApp) {
                if (targetPhone || adminOnly) {
                    console.log(`[Notification] 💬 SIMULATED WHATSAPP SENT TO: ${adminOnly ? 'Admins' : targetPhone}`);
                }
            }

            // 4. Dispatch Push (Simulated)
            if (alertEnabled && usePush && adminOnly) {
                console.log(`[Notification] 🔔 SIMULATED PUSH NOTIFICATION TO ADMINS: ${subject}`);
            }

        } catch (error) {
            console.error('[NotificationService] Error dispatching notification:', error);
        }
    }
}

module.exports = new NotificationService();
