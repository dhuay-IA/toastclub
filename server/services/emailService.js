import nodemailer from "nodemailer";

const isEmailConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.MAIL_FROM
  );

const createTransporter = () => {
  if (!isEmailConfigured()) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and MAIL_FROM."
    );
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

export const sendOtpEmail = async ({ to, name, otp, expiresInMinutes }) => {
  const transporter = createTransporter();
  const appName = process.env.MAIL_APP_NAME || "ToastClub";
  const subject = `${appName}: tu codigo de verificacion`;
  const safeName = name?.trim() || "usuario";

  const text = [
    `Hola ${safeName},`,
    "",
    `Tu codigo de verificación para ${appName} es: ${otp}`,
    `Este codigo vence en ${expiresInMinutes} minutos.`,
    "",
    "Si no solicitaste este codigo, puedes ignorar este correo.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <p>Hola <strong>${safeName}</strong>,</p>
      <p>Tu codigo OTP para <strong>${appName}</strong> es:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 20px 0;">
        ${otp}
      </p>
      <p>Este codigo vence en <strong>${expiresInMinutes} minutos</strong>.</p>
      <p>Si no solicitaste este codigo, puedes ignorar este correo.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });
};

export const sendPasswordResetEmail = async ({
  to,
  name,
  code,
  expiresInMinutes,
}) => {
  const transporter = createTransporter();
  const appName = process.env.MAIL_APP_NAME || "ToastClub";
  const subject = `${appName}: restablece tu contrasena`;
  const safeName = name?.trim() || "usuario";

  const text = [
    `Hola ${safeName},`,
    "",
    `Tu codigo para restablecer la contrasena de ${appName} es: ${code}`,
    `Este codigo vence en ${expiresInMinutes} minutos.`,
    "",
    "Si no solicitaste este cambio, ignora este correo.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <p>Hola <strong>${safeName}</strong>,</p>
      <p>Tu codigo para restablecer la contrasena de <strong>${appName}</strong> es:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 20px 0;">
        ${code}
      </p>
      <p>Este codigo vence en <strong>${expiresInMinutes} minutos</strong>.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });
};

export const emailConfigStatus = () => ({
  configured: isEmailConfigured(),
});
