import nodemailer from "nodemailer";

const isSmtpConfigured = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.MAIL_FROM
  );

const isBrevoApiConfigured = () =>
  Boolean(process.env.BREVO_API_KEY && process.env.MAIL_FROM);

const isDevelopment = () => process.env.NODE_ENV === "development";

const shouldAllowDevFallback = () =>
  process.env.EMAIL_DEV_FALLBACK === "true" || isDevelopment();

export const shouldExposeEmailCodes = () => shouldAllowDevFallback();

const buildEmailError = (error) => {
  if (error?.code === "ETIMEDOUT") {
    return new Error(
      "No se pudo conectar al servidor de correo a tiempo. Revisa la configuración SMTP o usa la API HTTP de Brevo si tu hosting bloquea SMTP saliente."
    );
  }

  if (error?.code === "EAUTH") {
    return new Error(
      "El servidor SMTP rechazó las credenciales. Revisa SMTP_USER y SMTP_PASSWORD."
    );
  }

  return error;
};

const parseMailFrom = () => {
  const value = process.env.MAIL_FROM?.trim();

  if (!value) {
    throw new Error("MAIL_FROM no está configurado.");
  }

  const match = value.match(/^(?:"?([^"]*)"?\s)?<([^>]+)>$/);

  if (match) {
    return {
      name: match[1]?.trim() || undefined,
      email: match[2].trim(),
    };
  }

  return {
    name: undefined,
    email: value,
  };
};

const createTransporter = () => {
  if (!isSmtpConfigured()) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and MAIL_FROM."
    );
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure:
      process.env.SMTP_SECURE === "true" ||
      Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT || 10000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT || 10000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT || 20000),
  });
};

const sendWithBrevoApi = async ({ to, subject, text, html }) => {
  if (!isBrevoApiConfigured()) {
    throw new Error("La API de Brevo no está configurada.");
  }

  const sender = parseMailFrom();
  const response = await fetch(
    process.env.BREVO_API_BASE_URL || "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        textContent: text,
        htmlContent: html,
      }),
    }
  );

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `La API de Brevo rechazó el envío (${response.status}). ${responseText || "Sin detalle adicional."}`
    );
  }
};

const sendWithSmtp = async (message) => {
  const transporter = createTransporter();
  await transporter.sendMail(message);
};

const sendEmail = async ({ debugLabel, debugCode, ...message }) => {
  try {
    if (isBrevoApiConfigured()) {
      await sendWithBrevoApi(message);
      return;
    }

    await sendWithSmtp(message);
  } catch (error) {
    const normalizedError = buildEmailError(error);

    if (shouldAllowDevFallback()) {
      console.warn(
        `[email] No se pudo enviar "${debugLabel}". Se habilitó el fallback de desarrollo.`
      );
      console.warn(normalizedError);
      if (debugCode) {
        console.warn(`[email] Código de desarrollo para ${message.to}: ${debugCode}`);
      }
      return;
    }

    throw normalizedError;
  }
};

export const sendOtpEmail = async ({ to, name, otp, expiresInMinutes }) => {
  const appName = process.env.MAIL_APP_NAME || "ToastClub";
  const subject = `${appName}: tu código de verificación`;
  const safeName = name?.trim() || "usuario";

  const text = [
    `Hola ${safeName},`,
    "",
    `Tu código de verificación para ${appName} es: ${otp}`,
    `Este código vence en ${expiresInMinutes} minutos.`,
    "",
    "Si no solicitaste este código, puedes ignorar este correo.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <p>Hola <strong>${safeName}</strong>,</p>
      <p>Tu código OTP para <strong>${appName}</strong> es:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 20px 0;">
        ${otp}
      </p>
      <p>Este código vence en <strong>${expiresInMinutes} minutos</strong>.</p>
      <p>Si no solicitaste este código, puedes ignorar este correo.</p>
    </div>
  `;

  await sendEmail({
    debugLabel: "código OTP",
    debugCode: otp,
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
  const appName = process.env.MAIL_APP_NAME || "ToastClub";
  const subject = `${appName}: restablece tu contraseña`;
  const safeName = name?.trim() || "usuario";

  const text = [
    `Hola ${safeName},`,
    "",
    `Tu código para restablecer la contraseña de ${appName} es: ${code}`,
    `Este código vence en ${expiresInMinutes} minutos.`,
    "",
    "Si no solicitaste este cambio, ignora este correo.",
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
      <p>Hola <strong>${safeName}</strong>,</p>
      <p>Tu código para restablecer la contraseña de <strong>${appName}</strong> es:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; margin: 20px 0;">
        ${code}
      </p>
      <p>Este código vence en <strong>${expiresInMinutes} minutos</strong>.</p>
      <p>Si no solicitaste este cambio, ignora este correo.</p>
    </div>
  `;

  await sendEmail({
    debugLabel: "código de recuperación",
    debugCode: code,
    from: process.env.MAIL_FROM,
    to,
    subject,
    text,
    html,
  });
};

export const emailConfigStatus = () => ({
  configured: isBrevoApiConfigured() || isSmtpConfigured(),
  provider: isBrevoApiConfigured() ? "brevo-api" : isSmtpConfigured() ? "smtp" : null,
});
