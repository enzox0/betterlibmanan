import { config } from "@/shared/config";

export function createOtpEmail(otp: string, name: string) {
  const text = `
Hi ${name},

Please use the following 6-digit code to verify your email address for BetterLibmanan admin registration:

${otp}

This code will expire in 15 minutes.

If you didn't request this code, please ignore this email.

Best regards,
BetterLibmanan Team
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email - BetterLibmanan</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      padding: 30px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .logo {
      color: white;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .content {
      background-color: white;
      padding: 40px 30px;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .greeting {
      color: #1f2937;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .message {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .otp-box {
      background-color: #f3f4f6;
      border-radius: 8px;
      padding: 25px;
      text-align: center;
      margin-bottom: 30px;
    }
    .otp {
      font-size: 36px;
      font-weight: bold;
      color: #1e40af;
      letter-spacing: 8px;
    }
    .note {
      color: #9ca3af;
      font-size: 14px;
      margin-bottom: 30px;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #9ca3af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">BetterLibmanan</div>
    </div>
    <div class="content">
      <div class="greeting">Hi ${name},</div>
      <p class="message">
        Please use the following 6-digit code to verify your email address for
        BetterLibmanan admin registration:
      </p>
      <div class="otp-box">
        <div class="otp">${otp}</div>
      </div>
      <p class="note">This code will expire in 15 minutes.</p>
      <p class="message">
        If you didn't request this code, please ignore this email.
      </p>
      <div class="footer">
        <p>Best regards,<br>BetterLibmanan Team</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

  return {
    subject: "Verify Your Email - BetterLibmanan",
    text,
    html,
  };
}

export function createRegistrationSuccessEmail(name: string) {
  const text = `
Hi ${name},

Congratulations! Your admin registration request has been submitted successfully.

Your account is now pending review by a Super Admin. You will be notified once your request has been approved.

You can log in to the admin dashboard after your registration has been approved here: ${config.app.url}/admin/login

Best regards,
BetterLibmanan Team
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Successful - BetterLibmanan</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      padding: 30px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .logo {
      color: white;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .content {
      background-color: white;
      padding: 40px 30px;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .greeting {
      color: #1f2937;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .message {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .success-badge {
      background-color: #d1fae5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin-bottom: 30px;
    }
    .success-text {
      color: #065f46;
      font-size: 18px;
      font-weight: 600;
    }
    .button-container {
      text-align: center;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      padding: 14px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 16px;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #9ca3af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">BetterLibmanan</div>
    </div>
    <div class="content">
      <div class="greeting">Hi ${name},</div>
      <div class="success-badge">
        <div class="success-text">Registration Submitted Successfully!</div>
      </div>
      <p class="message">
        Congratulations! Your admin registration request has been submitted
        successfully. Your account is now pending review by a Super Admin. You
        will be notified once your request has been approved.
      </p>
      <div class="button-container">
        <a href="${config.app.url}/admin/login" class="button">Go to Login Page</a>
      </div>
      <div class="footer">
        <p>Best regards,<br>BetterLibmanan Team</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

  return {
    subject: "Registration Successful - BetterLibmanan",
    text,
    html,
  };
}

export function createApprovalEmail(name: string) {
  const text = `
Hi ${name},

Great news! Your admin registration request for BetterLibmanan has been approved!

You can now log in to the admin dashboard using the credentials you set during registration.

Login here: ${config.app.url}/admin/login

Best regards,
BetterLibmanan Team
`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Admin Access Has Been Approved - BetterLibmanan</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      padding: 30px;
      border-radius: 12px 12px 0 0;
      text-align: center;
    }
    .logo {
      color: white;
      font-size: 24px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .content {
      background-color: white;
      padding: 40px 30px;
      border-radius: 0 0 12px 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .greeting {
      color: #1f2937;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .message {
      color: #6b7280;
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 30px;
    }
    .success-badge {
      background-color: #d1fae5;
      border: 1px solid #a7f3d0;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin-bottom: 30px;
    }
    .success-text {
      color: #065f46;
      font-size: 18px;
      font-weight: 600;
    }
    .button-container {
      text-align: center;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: white;
      padding: 14px 40px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 16px;
      font-weight: 600;
      transition: opacity 0.2s;
    }
    .button:hover {
      opacity: 0.9;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #9ca3af;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">BetterLibmanan</div>
    </div>
    <div class="content">
      <div class="greeting">Hi ${name},</div>
      <div class="success-badge">
        <div class="success-text">Your Admin Access Has Been Approved!</div>
      </div>
      <p class="message">
        Great news! Your admin registration request for BetterLibmanan has been approved.
        You can now log in to the admin dashboard using the credentials you set during registration.
      </p>
      <div class="button-container">
        <a href="${config.app.url}/admin/login" class="button">Log In Now</a>
      </div>
      <div class="footer">
        <p>Best regards,<br>BetterLibmanan Team</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

  return {
    subject: "Your Admin Access Has Been Approved - BetterLibmanan",
    text,
    html,
  };
}
