// Email notification service for contact messages
// This is a basic implementation that can be enhanced with actual email services

interface EmailNotificationData {
  to: string;
  subject: string;
  message: string;
  senderName: string;
  senderEmail: string;
  contentType: string;
  contentId?: string;
}

/**
 * Sends email notification for new contact messages
 * In a production environment, this would integrate with services like:
 * - SendGrid
 * - Mailgun
 * - AWS SES
 * - Resend
 */
export async function sendContactNotification(data: EmailNotificationData): Promise<boolean> {
  try {
    // For now, we'll just log the notification
    // In production, replace this with actual email service integration
    console.log('📧 Email Notification:', {
      to: data.to,
      subject: `[BrightonHub] ${data.subject}`,
      from: 'noreply@brightonhub.com',
      content: `
        New message from ${data.senderName} (${data.senderEmail})
        
        Subject: ${data.subject}
        Message: ${data.message}
        
        Content Type: ${data.contentType}
        ${data.contentId ? `Content ID: ${data.contentId}` : ''}
        
        --
        This message was sent through BrightonHub contact system.
        Reply directly to ${data.senderEmail} to respond.
      `
    });

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}

/**
 * Template for vendor notification emails
 */
export function createVendorNotificationEmail(
  vendorName: string,
  senderName: string,
  senderEmail: string,
  subject: string,
  message: string,
  contentType: string,
  contentTitle?: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Message - BrightonHub</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
        .message-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { color: #666; font-size: 14px; margin-top: 20px; }
        .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Message</h1>
            <p>Hello ${vendorName},</p>
        </div>
        <div class="content">
            <p>You have received a new contact message through BrightonHub:</p>
            
            <div class="message-box">
                <h3>From: ${senderName}</h3>
                <p><strong>Email:</strong> ${senderEmail}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Regarding:</strong> ${contentType}${contentTitle ? ` - ${contentTitle}` : ''}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            </div>
            
            <p>To respond to this message, you can:</p>
            <ul>
                <li>Reply directly to ${senderEmail}</li>
                <li><a href="#" class="button">View in BrightonHub Messages</a></li>
            </ul>
        </div>
        <div class="footer">
            <p>This message was sent through the BrightonHub contact system.</p>
            <p>© 2025 BrightonHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
  `.trim();
}

/**
 * Send notification to vendor when they receive a new message
 */
export async function notifyVendorOfNewMessage(
  vendorEmail: string,
  vendorName: string,
  senderName: string,
  senderEmail: string,
  subject: string,
  message: string,
  contentType: string,
  contentTitle?: string
): Promise<boolean> {
  const emailContent = createVendorNotificationEmail(
    vendorName,
    senderName,
    senderEmail,
    subject,
    message,
    contentType,
    contentTitle
  );

  return await sendContactNotification({
    to: vendorEmail,
    subject: `New message: ${subject}`,
    message: emailContent,
    senderName,
    senderEmail,
    contentType,
  });
}
