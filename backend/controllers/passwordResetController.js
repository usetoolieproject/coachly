import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { Resend } from 'resend';
import { getSupabaseClient } from '../repositories/supabaseClient.js';

// Initialize Resend
let resend = null;

export const initializeResend = () => {
  if (process.env.RESEND_API_KEY) {
    try {
      resend = new Resend(process.env.RESEND_API_KEY);
      console.log('✅ Password Reset Resend initialized');
    } catch (error) {
      console.error('❌ Password Reset Resend initialization failed:', error);
    }
  } else {
    console.warn('⚠️ RESEND_API_KEY not configured for password reset');
  }
};

/**
 * Request password reset - sends email with reset token
 */
export const requestPasswordReset = async (req, res) => {
  try {
    if (!resend) {
      return res.status(500).json({ 
        error: 'Email service not configured' 
      });
    }

    const supabase = getSupabaseClient();
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name')
      .eq('email', email)
      .single();

    // Always return success to prevent email enumeration
    if (userError || !user) {
      console.log('❌ Password reset requested for non-existent email:', email);
      return res.json({ 
        message: 'If an account exists with this email, a password reset link has been sent.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetTokenHash,
        reset_token_expiry: resetTokenExpiry.toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Error storing reset token:', updateError);
      console.error('Error details:', JSON.stringify(updateError, null, 2));
      return res.status(500).json({ 
        error: 'Failed to process password reset request',
        details: updateError.message 
      });
    }

    // Construct reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'https://usecoachly.com'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Coachly <noreply@usecoachly.com>',
      to: [email],
      subject: 'Reset Your Coachly Password',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { padding: 40px 30px; }
              .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .button:hover { opacity: 0.9; }
              .footer { background: #f8f8f8; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #eee; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔒 Reset Your Password</h1>
              </div>
              <div class="content">
                <p>Hi ${user.first_name || 'there'},</p>
                <p>We received a request to reset your password for your Coachly account.</p>
                <p>Click the button below to choose a new password:</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                <p style="color: #666; font-size: 14px; margin-top: 20px;">Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea; font-size: 12px;">${resetUrl}</p>
                <div class="warning">
                  <strong>⚠️ Security Note:</strong> This link will expire in 1 hour. If you didn't request this password reset, you can safely ignore this email.
                </div>
                <p style="margin-top: 30px;">Best regards,<br><strong>The Coachly Team</strong></p>
              </div>
              <div class="footer">
                <p>This is an automated message from Coachly. Please do not reply to this email.</p>
                <p>&copy; ${new Date().getFullYear()} Coachly. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    console.log('✅ Password reset email sent:', data);

    res.json({ 
      message: 'If an account exists with this email, a password reset link has been sent.' 
    });

  } catch (error) {
    console.error('❌ Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

/**
 * Reset password using token
 */
export const resetPassword = async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash the provided token to compare with stored hash
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, reset_token, reset_token_expiry')
      .eq('email', email)
      .eq('reset_token', resetTokenHash)
      .single();

    if (userError || !user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token has expired
    if (new Date(user.reset_token_expiry) < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired. Please request a new one.' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expiry: null
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      return res.status(500).json({ error: 'Failed to reset password' });
    }

    console.log('✅ Password reset successful for user:', user.id);

    res.json({ message: 'Password reset successful. You can now log in with your new password.' });

  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
