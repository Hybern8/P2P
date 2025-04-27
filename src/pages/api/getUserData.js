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

  try {
    // Parse cookie from request headers
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
    const userId = cookies.auth_token;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: No auth token found' });
    }

    pool = await sql.connect(config);

    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT id, name, email, policy, premium, claimStatus, pool, benefit, noClaimRefund, startDate
        FROM Users 
        WHERE id = @userId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.recordset[0];

    res.status(200).json(user);
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  } finally {
    if (pool) await pool.close();
  }
}
