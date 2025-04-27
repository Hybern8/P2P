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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  const cookies = parse(req.headers.cookie || '');
  const cookieEmail = cookies.userEmail;
  const emailToUse = email || cookieEmail;

  if (!emailToUse) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    pool = await sql.connect(config);

    const result = await pool.request()
      .input('email', sql.VarChar, emailToUse.trim().toLowerCase())
      .query(`
        SELECT id, name, email, pool, benefit, claimStatus
        FROM Users
        WHERE LOWER(email) = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.recordset[0];

    // Prevent fetching if the user has a 'Deceased' status
    if (user.claimStatus && user.claimStatus.toLowerCase() === 'deceased') {
      return res.status(403).json({ error: 'This Policyholder has a Deceased record already' });
    }

    res.status(200).json({ user });

  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  } finally {
    if (pool) await pool.close();
  }
}
