/**
 * ToastClub — Google Apps Script backend
 *
 * SETUP (one-time):
 *  1. Go to https://script.google.com and create a new project.
 *  2. Paste this file contents into the editor.
 *  3. Change SHEET_ID below to the ID of your Google Sheet
 *     (the long string in the Sheet URL between /d/ and /edit).
 *  4. In the Sheet, create a tab named "Users" with these headers in row 1:
 *       A: Email | B: Name | C: OTP | D: OTP_Expiry | E: Verified | F: Registered_At
 *  5. Click Deploy > New deployment > Web app.
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  6. Copy the web app URL and paste it into your .env.local as VITE_GAS_URL.
 */

var SHEET_ID = "1tfW0wEgbiEUnAU4dci9LMo6f_lwS2OsF7OwT-_g_cFc"; // <-- replace this
var OTP_EXPIRY_MINUTES = 10;

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var result;

    if (data.action === "sendOTP") {
      result = handleSendOTP(data.email, data.name);
    } else if (data.action === "verifyOTP") {
      result = handleVerifyOTP(data.email, data.code);
    } else {
      result = { success: false, message: "Acción desconocida." };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ---------------------------------------------------------------------------

function handleSendOTP(email, name) {
  if (!email || !isValidEmail(email)) {
    return { success: false, message: "Email inválido." };
  }

  var sheet = getSheet();
  var row = findRowByEmail(sheet, email);
  var otp = generateOTP();
  var expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  if (row) {
    // Existing user — update OTP
    sheet.getRange(row, 3).setValue(otp);         // C: OTP
    sheet.getRange(row, 4).setValue(expiry);       // D: OTP_Expiry
    sheet.getRange(row, 5).setValue(false);        // E: Verified (reset)
  } else {
    // New user — append row
    sheet.appendRow([
      email,
      name || "",
      otp,
      expiry,
      false,
      new Date().toISOString()
    ]);
  }

  sendOTPEmail(email, otp);
  return { success: true, message: "Código enviado." };
}

function handleVerifyOTP(email, code) {
  if (!email || !code) {
    return { success: false, message: "Datos incompletos." };
  }

  var sheet = getSheet();
  var row = findRowByEmail(sheet, email);

  if (!row) {
    return { success: false, message: "Email no encontrado." };
  }

  var storedOTP  = String(sheet.getRange(row, 3).getValue()).trim();
  var expiryStr  = sheet.getRange(row, 4).getValue();
  var expiry     = new Date(expiryStr);

  if (new Date() > expiry) {
    return { success: false, message: "El código ha expirado. Solicita uno nuevo." };
  }

  if (storedOTP !== String(code).trim()) {
    return { success: false, message: "Código incorrecto." };
  }

  // Mark verified and clear OTP
  sheet.getRange(row, 3).setValue("");
  sheet.getRange(row, 4).setValue("");
  sheet.getRange(row, 5).setValue(true);

  return { success: true, message: "Verificado." };
}

// ---------------------------------------------------------------------------

function getSheet() {
  return SpreadsheetApp
    .openById(SHEET_ID)
    .getSheetByName("Users");
}

function findRowByEmail(sheet, email) {
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) { // skip header row
    if (String(data[i][0]).toLowerCase() === email.toLowerCase()) {
      return i + 1; // 1-indexed row number
    }
  }
  return null;
}

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sendOTPEmail(email, otp) {
  MailApp.sendEmail({
    to: email,
    subject: "Tu código de verificación — ToastClub",
    body:
      "Hola,\n\n" +
      "Tu código de verificación para ToastClub es:\n\n" +
      "  " + otp + "\n\n" +
      "Este código expira en " + OTP_EXPIRY_MINUTES + " minutos.\n\n" +
      "Si no solicitaste este código, ignora este mensaje.\n\n" +
      "— ToastClub"
  });
}
