// /pages/api/recordPayment.js
import sql from 'mssql';
import { parse } from 'cookie';

const config = {
  user: 'hyber',
  password: '335555',
  server: 'localhost\\SQLEXPRESS',
  database: 'p2p',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount } = req.body;
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const userId = parseInt(cookies.auth_token, 10);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid auth token' });
  }

  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  let pool;
  try {
    pool = await sql.connect(config);

    // Update the Users table with the payment amount in the "premium" column
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('amount', sql.Money, amount)
      .query(`
        UPDATE Users
        SET premium = @amount
        WHERE id = @userId
      `);

    // Insert the payment into the Contributions table
    await pool.request()
      .input('userId', sql.Int, userId)
      .input('amount', sql.Money, amount)
      .input('date', sql.DateTime, new Date())  // Current date and time
      .query(`
        INSERT INTO Contributions (userId, amount, date)
        VALUES (@userId, @amount, @date)
      `);

    return res.status(200).json({ message: 'Payment recorded and contribution added successfully' });
  } catch (error) {
    console.error('Error during payment processing:', error);
    return res.status(500).json({ error: 'Internal Server Error: Payment failed' });
  } finally {
    if (pool) await pool.close();
  }
}
