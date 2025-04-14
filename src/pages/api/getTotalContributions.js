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

    // Query the total contributions from the Contributions table
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT SUM(totalPremium) AS totalContributions
        FROM Contributions
        WHERE userId = @userId
      `);

    if (result.recordset.length === 0 || result.recordset[0].totalContributions === null) {
      return res.status(404).json({ error: 'No contributions found' });
    }

    const totalContributions = result.recordset[0].totalContributions;

    res.status(200).json({ totalContributions });
  } catch (err) {
    console.error('Database Error:', err);
    res.status(500).json({ error: 'Error fetching total contributions' });
  } finally {
    if (pool) await pool.close();
  }
}
