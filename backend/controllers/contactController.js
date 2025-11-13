import { Resend } from 'resend';

// Initialize Resend
let resend = null;

export const initializeResend = () => {
  if (process.env.RESEND_API_KEY) {
    try {
      resend = new Resend(process.env.RESEND_API_KEY);
      console.log('✅ Resend initialized');
    } catch (error) {
      console.error('❌ Resend initialization failed:', error);
    }
  } else {
    console.warn('⚠️ RESEND_API_KEY not configured');
  }
};

/**
 * Send contact form submission via Resend
 */
export const sendContactFormEmail = async (req, res) => {
  try {
    if (!resend) {
      return res.status(500).json({ 
        error: 'Email service not configured' 
      });
    }

    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Name, email, and message are required' 
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email address' 
      });
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Coachly Contact Form <noreply@usecoachly.com>',
      to: ['usecoachly@hotmail.com'],
      replyTo: email,
      subject: subject || `New Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #7c3aed; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 20px; }
              .label { font-weight: bold; color: #555; margin-bottom: 5px; }
              .value { background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #7c3aed; }
              .footer { text-align: center; margin-top: 20px; color: #888; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 24px;">🔔 New Contact Form Submission</h1>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">From:</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value"><a href="mailto:${email}">${email}</a></div>
                </div>
                ${subject ? `
                <div class="field">
                  <div class="label">Subject:</div>
                  <div class="value">${subject}</div>
                </div>
                ` : ''}
                <div class="field">
                  <div class="label">Message:</div>
                  <div class="value">${message.replace(/\n/g, '<br>')}</div>
                </div>
                <div class="footer">
                  <p>Sent via Coachly Contact Form at ${new Date().toLocaleString()}</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
New Contact Form Submission

From: ${name}
Email: ${email}
${subject ? `Subject: ${subject}\n` : ''}

Message:
${message}

---
Sent via Coachly Contact Form at ${new Date().toLocaleString()}
      `
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ 
        error: 'Failed to send email' 
      });
    }

    console.log('✅ Contact form email sent:', data);

    return res.json({ 
      success: true, 
      message: 'Your message has been sent successfully!' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      error: 'Failed to send message. Please try again later.' 
    });
  }
};

export { initializeResend as default };
