// pages/api/fetchUserByEmail.js
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
  let pool;

  // Ensure the method is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Try to get the email from the cookie if it is not in the body
  const cookies = parse(req.headers.cookie || ''); // Parse cookies from the request
  const cookieEmail = cookies.userEmail; // Cookie set earlier in the frontend

  const emailToUse = email || cookieEmail; // Use email from body or cookie

  // Ensure we have an email to proceed
  if (!emailToUse) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Connect to the database
    pool = await sql.connect(config);

    // Query the database to fetch the user
    const result = await pool.request()
      .input('email', sql.VarChar, emailToUse.trim().toLowerCase())
      .query(`
        SELECT id, name, email, pool, benefit
        FROM Users
        WHERE LOWER(email) = @email
      `);

    // Check if a user was found
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.recordset[0];
    res.status(200).json({ user });

  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  } finally {
    if (pool) await pool.close();
  }
}
