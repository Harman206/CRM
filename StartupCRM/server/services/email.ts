import nodemailer from 'nodemailer';

// Configure email transporter based on environment variables
const createTransporter = () => {
  const emailService = process.env.EMAIL_SERVICE || process.env.SMTP_SERVICE || 'gmail';
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;

  if (!emailUser || !emailPass) {
    console.warn('Email credentials not provided. Email functionality will be limited.');
    return null;
  }

  // Use custom SMTP if provided, otherwise use service
  if (smtpHost && smtpPort) {
    return nodemailer.createTransporter({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: parseInt(smtpPort) === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  return nodemailer.createTransporter({
    service: emailService,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

const transporter = createTransporter();

export interface EmailMessage {
  to: string;
  subject: string;
  content: string;
  from?: string;
}

export async function sendEmail(message: EmailMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!transporter) {
    return {
      success: false,
      error: 'Email service not configured. Please provide EMAIL_USER and EMAIL_PASS environment variables.'
    };
  }

  try {
    const info = await transporter.sendMail({
      from: message.from || process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: message.to,
      subject: message.subject,
      html: message.content,
      text: message.content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    });

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: `Failed to send email: ${(error as Error).message}`
    };
  }
}

export async function validateEmailConfiguration(): Promise<{ isValid: boolean; error?: string }> {
  if (!transporter) {
    return {
      isValid: false,
      error: 'Email transporter not configured'
    };
  }

  try {
    await transporter.verify();
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Email configuration invalid: ${(error as Error).message}`
    };
  }
}

// Simulate LinkedIn message sending (placeholder for future integration)
export async function sendLinkedInMessage(
  recipientUrl: string, 
  message: string
): Promise<{ success: boolean; error?: string }> {
  // This is a placeholder for LinkedIn API integration
  // In a real implementation, you would integrate with LinkedIn's API
  // following their terms of service and rate limits
  
  console.log(`LinkedIn message to ${recipientUrl}: ${message}`);
  
  // Simulate success for now
  return {
    success: true
  };
}
