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

  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const userId = parseInt(cookies.auth_token, 10); // Make sure auth_token is set

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No valid auth token' });
  }

  const { policy } = req.body;
  const validPolicies = ['basic', 'premium', 'comprehensive'];

  if (!validPolicies.includes(policy.toLowerCase())) {
    return res.status(400).json({ error: 'Invalid policy type' });
  }

  let pool;

  try {
    pool = await sql.connect(config);

    // Check if user exists in the database
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('policy', sql.VarChar, policy)
      .query(`
        UPDATE Users
        SET policy = @policy
        WHERE id = @userId
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'User not found or policy already set' });
    }

    return res.status(200).json({ message: 'Policy updated successfully' });
  } catch (err) {
    console.error('Error updating policy:', err);
    return res.status(500).json({ error: 'Failed to update policy' });
  } finally {
    if (pool) await pool.close();
  }
}
