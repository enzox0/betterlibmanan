import nodemailer from "nodemailer";
import { config } from "../config";
import { logger } from "../logger";

export class Mailer {
  private static instance: Mailer;
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  private constructor() {
    if (
      config.smtp.host !== "smtp.example.com" &&
      config.smtp.user !== "user@example.com"
    ) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
      });
      this.isConfigured = true;
      logger.info("Mailer configured with SMTP host:", config.smtp.host);
    } else {
      logger.warn(
        "Mailer not configured - using default placeholder SMTP settings",
      );
    }
  }

  static getInstance(): Mailer {
    if (!Mailer.instance) {
      Mailer.instance = new Mailer();
    }
    return Mailer.instance;
  }

  async sendHealthErrorReport(errorDetails: any): Promise<void> {
    if (!this.isConfigured || !this.transporter) {
      logger.warn("Skipping health error report email - SMTP not configured");
      return;
    }

    const mailOptions = {
      from: config.smtp.from,
      to: config.admin.email,
      subject: `[ALERT] Backend Health Check Failed`,
      text: `
        Health Check Failure Alert

        Time: ${new Date().toISOString()}
        Error Details:
        ${JSON.stringify(errorDetails, null, 2)}
      `,
      html: `
        <h1>Health Check Failure Alert</h1>
        <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        <h3>Error Details:</h3>
        <pre>${JSON.stringify(errorDetails, null, 2)}</pre>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      logger.info("Health error report email sent:", info.messageId);
    } catch (error) {
      logger.error("Failed to send health error report email:", error);
    }
  }
}

export const mailer = Mailer.getInstance();
