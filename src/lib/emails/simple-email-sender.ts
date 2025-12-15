/**
 * Simple Email Sender
 * Quick implementation for sending invitation emails
 */

// ============================================
// OPTION 1: Resend (Recommended)
// ============================================

// Install: npm install resend
// Get API key from: https://resend.com

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmailResend(
  toEmail: string,
  studentName: string,
  invitationCode: string,
  organizationName: string
) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 40px 0;
          }
          .container {
            background-color: #ffffff;
            max-width: 600px;
            margin: 0 auto;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .title {
            color: #1f2937;
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
          }
          .subtitle {
            color: #6b7280;
            font-size: 16px;
          }
          .content {
            color: #374151;
            font-size: 16px;
            line-height: 24px;
            margin-bottom: 24px;
          }
          .code-box {
            background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
            border: 2px solid #c4b5fd;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin: 32px 0;
          }
          .code-label {
            color: #6b21a8;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .code {
            color: #6b21a8;
            font-size: 32px;
            font-weight: bold;
            font-family: monospace;
            letter-spacing: 4px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: bold;
            margin: 24px 0;
          }
          .steps {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
          }
          .step {
            margin: 8px 0;
            color: #4b5563;
          }
          .benefits {
            background-color: #eff6ff;
            padding: 20px;
            border-radius: 8px;
            margin: 24px 0;
          }
          .benefit-item {
            margin: 8px 0;
            color: #1e40af;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="title">Welcome to StudyHabit! 🎉</div>
            <div class="subtitle">Your Learning Journey Starts Here</div>
          </div>

          <div class="content">
            <p>Hi <strong>${studentName}</strong>,</p>
            <p>
              Great news! You've been invited to join <strong>${organizationName}</strong> 
              on StudyHabit - a productivity tracker designed specifically for students like you!
            </p>
          </div>

          <div class="code-box">
            <div class="code-label">Your Invitation Code</div>
            <div class="code">${invitationCode}</div>
          </div>

          <center>
            <a href="https://yourapp.com/invitation?code=${invitationCode}" class="button">
              Accept Invitation ✨
            </a>
          </center>

          <div class="steps">
            <p style="font-weight: 600; color: #374151; margin-bottom: 12px;">Getting Started (3 Simple Steps):</p>
            <div class="step">1️⃣ Click the button above or visit the invitation page</div>
            <div class="step">2️⃣ Enter your invitation code: <code style="background: #f3e8ff; padding: 2px 8px; border-radius: 4px; color: #6b21a8;">${invitationCode}</code></div>
            <div class="step">3️⃣ Create your password and start tracking!</div>
          </div>

          <div class="benefits">
            <p style="font-weight: 600; color: #1e40af; margin-bottom: 12px;">
              This is a completely <strong>FREE</strong> account for students! 🎓
            </p>
            <div class="benefit-item">✅ Track all your study sessions</div>
            <div class="benefit-item">✅ View beautiful progress charts</div>
            <div class="benefit-item">✅ Compete on the leaderboard</div>
            <div class="benefit-item">✅ Build streaks and reach goals</div>
          </div>

          <div class="content">
            <p>
              If you have any questions, just reply to this email. We're here to help! 💙
            </p>
          </div>

          <div class="footer">
            <p>Happy studying! 📚</p>
            <p><strong>The StudyHabit Team</strong></p>
            <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
              This invitation will expire in 30 days
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  const emailText = `
Hi ${studentName},

You've been invited to join ${organizationName} on StudyHabit!

Your invitation code is: ${invitationCode}

To get started:
1. Visit the StudyHabit invitation page
2. Enter your invitation code: ${invitationCode}
3. Set up your password
4. Start tracking your study sessions!

This is a completely FREE account for students. You'll have access to:
✅ Study session tracking
✅ Progress charts and analytics
✅ Leaderboard competition
✅ Streak tracking and goals

If you have any questions, feel free to reach out!

Happy studying! 💙
The StudyHabit Team
  `.trim();

  try {
    const data = await resend.emails.send({
      from: 'StudyHabit <invitations@studyhabit.com>', // Replace with your verified domain
      to: [toEmail],
      subject: `You're Invited to Join ${organizationName} on StudyHabit! 🎓`,
      html: emailHtml,
      text: emailText,
    });

    console.log('✅ Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

// ============================================
// OPTION 2: Simple Fetch API (Any Email Service)
// ============================================

export async function sendInvitationEmailAPI(
  toEmail: string,
  studentName: string,
  invitationCode: string,
  organizationName: string
) {
  // This can work with any email API (SendGrid, Mailgun, etc.)
  const emailData = {
    to: toEmail,
    subject: `You're Invited to Join ${organizationName} on StudyHabit! 🎓`,
    html: generateEmailHTML(studentName, invitationCode, organizationName),
  };

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      throw new Error('Email sending failed');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
}

// ============================================
// OPTION 3: Browser mailto: (No Server Needed)
// ============================================

export function openEmailClient(
  toEmail: string,
  studentName: string,
  invitationCode: string,
  organizationName: string
) {
  const subject = `You're Invited to Join ${organizationName} on StudyHabit! 🎓`;
  const body = `
Hi ${studentName},

You've been invited to join ${organizationName} on StudyHabit - a productivity tracker designed for students!

Your invitation code is: ${invitationCode}

To get started:
1. Visit the StudyHabit invitation page
2. Enter your invitation code: ${invitationCode}
3. Set up your password
4. Start tracking your study sessions!

This is a completely FREE account for students. You'll have access to:
✅ Study session tracking
✅ Progress charts and analytics
✅ Leaderboard competition
✅ Streak tracking and goals

Happy studying! 💙
The StudyHabit Team
  `.trim();

  const mailtoLink = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  
  // Open default email client
  window.location.href = mailtoLink;
  
  return { success: true, method: 'mailto' };
}

// ============================================
// Helper Functions
// ============================================

function generateEmailHTML(
  studentName: string,
  invitationCode: string,
  organizationName: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px; }
          .container { background-color: #ffffff; max-width: 600px; margin: 0 auto; padding: 40px; border-radius: 16px; }
          .title { color: #1f2937; font-size: 28px; font-weight: bold; text-align: center; margin-bottom: 24px; }
          .code-box { background: #f3e8ff; border: 2px solid #c4b5fd; border-radius: 12px; padding: 24px; text-align: center; margin: 32px 0; }
          .code { color: #6b21a8; font-size: 32px; font-weight: bold; font-family: monospace; letter-spacing: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">Welcome to StudyHabit! 🎉</div>
          <p>Hi <strong>${studentName}</strong>,</p>
          <p>You've been invited to join <strong>${organizationName}</strong> on StudyHabit!</p>
          <div class="code-box">
            <div style="color: #6b21a8; font-size: 14px; margin-bottom: 8px;">Your Invitation Code</div>
            <div class="code">${invitationCode}</div>
          </div>
          <p>This is a completely FREE account for students!</p>
          <p style="text-align: center; margin-top: 32px;">Happy studying! 💙<br/><strong>The StudyHabit Team</strong></p>
        </div>
      </body>
    </html>
  `;
}

// ============================================
// Usage Examples
// ============================================

/*
// Example 1: Using Resend
await sendInvitationEmailResend(
  'student@example.com',
  'John Doe',
  'STUDY2025',
  'Harvard University'
);

// Example 2: Using mailto: link (no server needed)
openEmailClient(
  'student@example.com',
  'John Doe',
  'STUDY2025',
  'Harvard University'
);

// Example 3: Using custom API
await sendInvitationEmailAPI(
  'student@example.com',
  'John Doe',
  'STUDY2025',
  'Harvard University'
);
*/

// ============================================
// Export for use in components
// ============================================

export const emailSender = {
  resend: sendInvitationEmailResend,
  api: sendInvitationEmailAPI,
  mailto: openEmailClient,
};
