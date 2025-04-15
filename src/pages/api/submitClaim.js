// pages/api/submitClaim.js
import sql from 'mssql';

const config = {
  user: 'hyber',
  password: '335555',
  server: 'localhost\\SQLEXPRESS',
  database: 'p2p',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const {
    userId,
    causeOfDeath,
    dateOfDeath,
    claimantName,
    claimantEmail,
    phone,
    bankName,
    accountNumber,
  } = req.body;

  if (
    !userId || !causeOfDeath || !dateOfDeath || !claimantName || !claimantEmail ||
    !phone || !bankName || !accountNumber
  ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let pool;
  try {
    pool = await sql.connect(config);

    // 🔍 Lookup user data from Users table
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT email, pool, benefit
        FROM Users
        WHERE id = @userId
      `);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { email, pool: userPool, benefit } = userResult.recordset[0];

    // ✅ Insert claim into Claims table
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('userEmail', sql.VarChar(100), email)
      .input('pool', sql.VarChar(50), userPool)
      .input('benefit', sql.Int, benefit)
      .input('causeOfDeath', sql.VarChar(255), causeOfDeath)
      .input('dateOfDeath', sql.Date, dateOfDeath)
      .input('claimantName', sql.VarChar(100), claimantName)
      .input('claimantEmail', sql.VarChar(100), claimantEmail)
      .input('phone', sql.VarChar(20), phone)
      .input('bankName', sql.VarChar(100), bankName)
      .input('accountNumber', sql.VarChar(30), accountNumber)
      .query(`
        INSERT INTO Claims (
          userID, email, pool, benefit,
          cause_of_death, date_of_death,
          claimant, claimant_email, claimant_phone,
          bank_name, account_number
        )
        VALUES (
          @userId, @userEmail, @pool, @benefit,
          @causeOfDeath, @dateOfDeath,
          @claimantName, @claimantEmail, @phone,
          @bankName, @accountNumber
        )
      `);

      // Update the claim status of the user to 'Deceased'
    const updateStatusResult = await pool.request()
    .input('userId', sql.Int, userId)
    .query(`
      UPDATE Users
      SET claimStatus = 'Deceased'
      WHERE id = @userId
    `);

    return res.status(200).json({ message: 'Claim submitted successfully' });
  } catch (err) {
    console.error('Error submitting claim:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    if (pool) await pool.close();
  }
}
