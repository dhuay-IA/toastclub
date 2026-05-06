import pool from "../config/db.js";

export const findUserByEmail = async (email) => {
  const [rows] = await pool.execute(
    `SELECT id, email, name, password_hash, role, is_verified, otp_code, otp_expires_at,
            otp_send_count, password_reset_code, password_reset_expires_at,
            password_reset_send_count, created_at, updated_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );

  return rows[0] ?? null;
};

export const findUserById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT id, email, name, password_hash, role, is_verified, otp_code, otp_expires_at,
            otp_send_count, password_reset_code, password_reset_expires_at,
            password_reset_send_count, created_at, updated_at
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );

  return rows[0] ?? null;
};

export const createUser = async ({ email, name, passwordHash, role = "student" }) => {
  const [result] = await pool.execute(
    `INSERT INTO users (email, name, password_hash, role, is_verified)
     VALUES (?, ?, ?, ?, 0)`,
    [email, name, passwordHash, role]
  );

  return findUserById(result.insertId);
};

export const updateUserRole = async ({ userId, role }) => {
  await pool.execute(
    `UPDATE users
     SET role = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [role, userId]
  );
};

export const listUsersForAdminReport = async () => {
  const [users] = await pool.execute(
    `SELECT id, email, name, role, created_at, updated_at
     FROM users
     WHERE role <> 'admin'
     ORDER BY id DESC`
  );

  const [sessionTotals] = await pool.execute(
    `SELECT user_id,
            COUNT(*) AS total_sessions,
            MAX(created_at) AS last_session_at
     FROM vr_sessions
     GROUP BY user_id`
  );

  const totalsByUserId = new Map(
    sessionTotals.map((row) => [
      row.user_id,
      {
        totalSessions: Number(row.total_sessions ?? 0),
        lastSessionAt: row.last_session_at,
      },
    ])
  );

  return users
    .map((user) => {
      const totals = totalsByUserId.get(user.id);
      return {
        ...user,
        total_sessions: totals?.totalSessions ?? 0,
        last_session_at: totals?.lastSessionAt ?? null,
      };
    })
    .sort((a, b) => {
      const aTime = new Date(a.last_session_at ?? a.updated_at).getTime();
      const bTime = new Date(b.last_session_at ?? b.updated_at).getTime();
      return bTime - aTime;
    });
};

export const storeUserOtp = async ({ userId, otp, expiresAt }) => {
  await pool.execute(
    `UPDATE users
     SET otp_code = ?,
         otp_expires_at = ?,
         otp_send_count = otp_send_count + 1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [otp, expiresAt, userId]
  );
};

export const verifyUserOtp = async ({ userId, otp }) => {
  const user = await findUserById(userId);

  if (!user || !user.otp_code || !user.otp_expires_at) {
    return {
      success: false,
      message: "No active OTP found for this user.",
    };
  }

  if (user.otp_code !== otp) {
    return {
      success: false,
      message: "Invalid OTP.",
    };
  }

  if (new Date(user.otp_expires_at).getTime() < Date.now()) {
    return {
      success: false,
      message: "OTP has expired.",
    };
  }

  await pool.execute(
    `UPDATE users
     SET is_verified = 1,
         otp_code = NULL,
         otp_expires_at = NULL,
         otp_send_count = 0,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [userId]
  );

  return {
    success: true,
  };
};

export const storePasswordResetCode = async ({ userId, code, expiresAt }) => {
  await pool.execute(
    `UPDATE users
     SET password_reset_code = ?,
         password_reset_expires_at = ?,
         password_reset_send_count = password_reset_send_count + 1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [code, expiresAt, userId]
  );
};

export const clearPasswordResetState = async ({ userId }) => {
  await pool.execute(
    `UPDATE users
     SET password_reset_code = NULL,
         password_reset_expires_at = NULL,
         password_reset_send_count = 0,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [userId]
  );
};

export const updateUserPassword = async ({ userId, passwordHash }) => {
  await pool.execute(
    `UPDATE users
     SET password_hash = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [passwordHash, userId]
  );
};

export const markUserAsVerified = async ({ userId }) => {
  await pool.execute(
    `UPDATE users
     SET is_verified = 1,
         otp_code = NULL,
         otp_expires_at = NULL,
         otp_send_count = 0,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [userId]
  );
};
